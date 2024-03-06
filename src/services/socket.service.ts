import { Repository, DataSource } from 'typeorm';
import {
  Message,
  Conversation,
  Notification,
  User,
  NotificationType,
} from '../entities';
import { AppError } from '../common/utils/AppError';
import { Server } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  filterNotification,
  jwtVerifyPromisified,
  userProfileRelations,
} from '../common';
import { userProfileSelectOptions } from '../common';

interface SocketData {
  name: string;
  age: number;
}

class SocketService {
  onlineUsers: Map<string, any>;
  io: SocketIOServer | null;
  server: Server | null;
  socket: Socket | null;
  AppDataSource: DataSource;

  constructor() {
    this.onlineUsers = new Map();
    this.io = null;
    this.server = null;
    this.socket = null;
  }

  async emitNotification(
    senderId: number,
    receiverUsername: string,
    type: NotificationType,
    metadata: any = {}
  ): Promise<void> {
    const userRepository: Repository<User> =
      this.AppDataSource.getRepository(User);

    const sender = await userRepository.findOne({
      where: { userId: senderId },
      select: userProfileSelectOptions,
      relations: userProfileRelations,
    });

    if (!sender) throw new AppError('User not found', 404);

    const receiver = await userRepository.findOne({
      where: { username: receiverUsername },
      select: { userId: true },
    });

    if (!receiver) throw new AppError('User not found', 404);

    let content = '';
    switch (type) {
      case NotificationType.Message:
        content = `sent you a message`;
        break;
      case NotificationType.Mention:
        content = `mentioned you in a ${metadata.tweetId ? 'diary' : 'reel'}`;
        break;
      case NotificationType.Follow:
        content = `followed you`;
        break;
      case NotificationType.Reply:
        content = `replyed to you`;
        break;
      case NotificationType.React:
        content = `reacted to your ${metadata.tweetId ? 'diary' : 'reel'}`;
        break;
      case NotificationType.Repost:
        content = `reposted your ${metadata.retweetId ? 'diary' : 'reel'}`;
        break;
      default:
        throw new AppError('Unknown notification type: ' + type, 400);
    }

    const notification = new Notification();
    notification.notificationFrom = sender;
    notification.content = content;
    notification.notificationTo = receiver;
    notification.isSeen = false;
    notification.type = type;
    notification.metadata = metadata;

    const savednotification = await this.AppDataSource.getRepository(
      Notification
    ).save(notification);

    if (receiver && sender) {
      this.io?.sockets
        .in(`user_${receiver.userId}_room`)
        .emit(
          'notification-receive',
          filterNotification(savednotification, receiver.userId)
        );
    }
  }

  updateAppDataSource(dataSource: any): void {
    this.AppDataSource = dataSource;
  }

  initializeSocket(server: Server, AppDataSource: any): void {
    this.server = server;
    this.AppDataSource = AppDataSource;

    this.io = require('socket.io')(this.server, {
      cors: {
        origin: (origin: any, callback: any) => {
          callback(null, true);
        },
        credentials: true,
        allowedHeaders: ['token'],
      },
    });

    if (!this.io) return;
    if (!process.env.ACCESSTOKEN_SECRET_KEY!)
      throw new AppError('JWT secret key not provided', 400);

    this.io
      .use(async (socket: Socket, next: any) => {
        if (!socket.handshake.headers.token)
          return next(new AppError('you are not logged in', 401));

        const payload = await jwtVerifyPromisified(
          socket.handshake.headers.token as string,
          process.env.ACCESSTOKEN_SECRET_KEY as string
        );

        const user = await this.AppDataSource.getRepository(User).findOne({
          where: { userId: payload.id },
          select: {
            userId: true,
            username: true,
            email: true,
            name: true,
          },
        });

        if (!user) {
          return next(new AppError('User does no longer exist', 401));
        }

        socket.data.user = user ? user : {};

        socket.join(`user_${user.userId}_room`);

        next();
      })
      .on('connection', (socket: Socket) => {
        console.log('socket connected');

        socket.on(
          'msg-send',
          async ({ receiverId, conversationId, text }: any) => {
            if (!receiverId || !conversationId || !text)
              throw new AppError('message data are required', 400);
            const { userId, username } = socket.data.user;

            const conversation = await this.AppDataSource.getRepository(
              Conversation
            ).findOne({
              where: { conversationId: conversationId },
              select: ['isUsersActive'],
            });

            if (!conversation) return;

            let isSeen = false;
            isSeen = conversation.isUsersActive[`userId_${receiverId}`];

            const newMessage = new Message();
            newMessage.conversationId = conversationId;
            newMessage.senderId = userId;
            newMessage.receiverId = receiverId;
            newMessage.text = text;
            newMessage.isSeen = isSeen;

            await this.AppDataSource.getRepository(Message).insert(newMessage);

            if (receiverId) {
              socket.to(`user_${receiverId}_room`).emit('msg-receive', {
                senderId: newMessage.senderId,
                messageId: newMessage.messageId,
                conversationId: newMessage.conversationId,
                isSeen: newMessage.isSeen,
                time: newMessage.time,
                text: newMessage.text,
                senderUsername: username,
                isFromMe: false,
              });
            }

            if (userId) {
              this.io?.sockets.in(`user_${userId}_room`).emit('msg-redirect', {
                senderId: newMessage.senderId,
                messageId: newMessage.messageId,
                conversationId: newMessage.conversationId,
                isSeen: newMessage.isSeen,
                time: newMessage.time,
                text: newMessage.text,
                senderUsername: username,
                isFromMe: true,
              });
            }
          }
        );

        socket.on('mark-notifications-as-seen', async () => {
          const { userId } = socket.data.user;
          await this.AppDataSource.getRepository(Notification).update(
            { isSeen: false, notificationTo: { userId } },
            { isSeen: true }
          );
        });

        socket.on('chat-opened', async ({ conversationId, contactId }: any) => {
          if (!conversationId || !contactId)
            throw new AppError('chat data is required', 400);
          const { userId } = socket.data.user;

          await this.AppDataSource.createQueryBuilder()
            .update(Conversation)
            .set({
              isUsersActive: () =>
                `jsonb_set(isUsersActive, '{userId_${userId}}', 'true')`,
            })
            .where('conversationId = :conversationId', {
              conversationId,
            })
            .execute();

          if (contactId) {
            socket.to(`user_${contactId}_room`).emit('status-of-contact', {
              conversationId,
              inConversation: true,
              isLeaved: false,
            });
          }

          await this.AppDataSource.getRepository(Message).update(
            { conversationId, receiverId: userId },
            { isSeen: true }
          );
        });

        socket.on('chat-closed', async ({ contactId, conversationId }: any) => {
          if (!contactId || !conversationId)
            throw new AppError('chat data are required', 400);
          const { userId } = socket.data.user;

          await this.AppDataSource.createQueryBuilder()
            .update(Conversation)
            .set({
              isUsersActive: () =>
                `jsonb_set(isUsersActive, '{userId_${userId}}', 'false')`,
            })
            .where('conversationId = :conversationId', {
              conversationId,
            })
            .execute();

          if (contactId) {
            socket.to(`user_${contactId}_room`).emit('status-of-contact', {
              conversationId,
              inConversation: false,
              isLeaved: false,
            });
          }
        });

        socket.on('disconnect', async () => {
          console.log(`Server disconnected from a client`);
          const { userId } = socket.data.user;

          if (!userId) return;

          await this.AppDataSource.createQueryBuilder()
            .update(Conversation)
            .set({
              isUsersActive: () =>
                `jsonb_set(isUsersActive, '{userId_${userId}}', 'false')`,
            })
            .where('"user1Id" = :userId OR "user2Id" = :userId', {
              userId,
            })
            .execute();
        });
      });
    console.log('WebSocket initialized ✔️');
  }
}

export default new SocketService();
