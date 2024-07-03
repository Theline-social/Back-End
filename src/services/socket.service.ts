import { Repository, DataSource } from 'typeorm';
import {
  Message,
  Conversation,
  Notification,
  User,
  NotificationType,
} from '../entities';
import { AppError } from '../common/utils/AppError';
import { METHODS, Server } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  filterNotification,
  filterSubNotification,
  jwtVerifyPromisified,
  notificationTypeContentMap,
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

  emitDeleteNotification(receiverId: number, notificationId: number) {
    if (receiverId && notificationId)
      this.io?.sockets
        .in(`user_${receiverId}_room`)
        .emit('notification-deleted', {
          notificationId,
        });
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
      select: {
        userId: true,
        blocking: { userId: true },
        muting: { userId: true },
      },
      relations: { muting: true, blocking: true },
    });

    if (!receiver) throw new AppError('User not found', 404);

    const blockingsIds = receiver.blocking.map((blocking) => blocking.userId);
    const mutingsIds = receiver.muting.map((muting) => muting.userId);

    if ([...blockingsIds, ...mutingsIds].includes(senderId)) return;

    const notification = new Notification();
    notification.notificationFrom = sender;
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

  async emitSubscriptionNotifications(
    receiverId: number,
    type: NotificationType,
    metadata: any = {}
  ): Promise<void> {
    const userRepository: Repository<User> =
      this.AppDataSource.getRepository(User);

    const receiver = await userRepository.findOne({
      where: { userId: receiverId },
      select: {
        userId: true,
      },
    });

    if (!receiver) throw new AppError('User not found', 404);

    const notification = new Notification();
    notification.notificationFrom = null;
    notification.notificationTo = receiver;
    notification.isSeen = false;
    notification.type = type;
    notification.metadata = metadata;

    const savednotification = await this.AppDataSource.getRepository(
      Notification
    ).save(notification);

    if (receiver) {
      this.io?.sockets
        .in(`user_${receiver.userId}_room`)
        .emit('notification-receive', filterSubNotification(savednotification));
    }
  }

  updateAppDataSource(dataSource: any): void {
    this.AppDataSource = dataSource;
  }

  initializeSocket(server: Server, AppDataSource: any): void {
    this.server = server;
    this.AppDataSource = AppDataSource;

    this.io = require('socket.io')(this.server, {
      path: '/api/socket.io',
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
console.log(1);

        try {
          const payload = await jwtVerifyPromisified(
            socket.handshake.headers.token as string,
            process.env.ACCESSTOKEN_SECRET_KEY as string
          );
console.log(2);

          const user = await this.AppDataSource.getRepository(User).findOne({
            where: { userId: payload.id },
            select: {
              userId: true,
              username: true,
              email: true,
              name: true,
            },
          });
          console.log(3);

          if (!user) {
            return next(new AppError('User does no longer exist', 401));
          }
          socket.data.user = user ? user : {};

          socket.join(`user_${user.userId}_room`);

          next();
        } catch (error) {
          return next(new AppError('error in socket connection', 400));
        }
      })
      .on('connection', (socket: Socket) => {
        socket.on(
          'msg-send',
          async ({ receiverId, conversationId, text }: any) => {
            if (!receiverId || !conversationId || !text) return;
            const { userId, username } = socket.data.user;

            const conversation = await this.AppDataSource.getRepository(
              Conversation
            ).findOne({
              where: { conversationId },
              select: ['isUsersActive', 'conversationId'],
            });

            if (!conversation) return;

            let isSeen = false;
            isSeen = conversation.isUsersActive[`userId_${receiverId}`];

            const newMessage = new Message();
            newMessage.senderId = userId;
            newMessage.receiverId = receiverId;
            newMessage.text = text;
            newMessage.isSeen = isSeen;
            newMessage.conversation = conversation;
            const savedMessages = await this.AppDataSource.getRepository(
              Message
            ).save(newMessage);

            if (receiverId) {
              socket.to(`user_${receiverId}_room`).emit('msg-receive', {
                senderId: savedMessages.senderId,
                messageId: savedMessages.messageId,
                conversationId: savedMessages.conversation.conversationId,
                isSeen: savedMessages.isSeen,
                createdAt: savedMessages.createdAt,
                text: savedMessages.text,
                senderUsername: username,
                isFromMe: false,
              });
            }

            if (userId) {
              this.io?.sockets.in(`user_${userId}_room`).emit('msg-redirect', {
                senderId: savedMessages.senderId,
                messageId: savedMessages.messageId,
                conversationId: savedMessages.conversation.conversationId,
                isSeen: savedMessages.isSeen,
                createdAt: savedMessages.createdAt,
                text: savedMessages.text,
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
          if (!conversationId || !contactId) return;
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
            });
          }

          await this.AppDataSource.getRepository(Message).update(
            { conversation: { conversationId }, receiverId: userId },
            { isSeen: true }
          );
        });

        socket.on('chat-closed', async ({ contactId, conversationId }: any) => {
          if (!contactId || !conversationId) return;
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
            });
          }
        });

        socket.on('disconnect', async () => {
          const { userId } = socket.data.user;

          if (!userId) return;

          await this.AppDataSource.createQueryBuilder()
            .update(Conversation)
            .set({
              isUsersActive: () =>
                `jsonb_set(isUsersActive, '{userId_${userId}}', 'false')`,
            })
            .where('user1.userId = :userId OR user2.userId = :userId', {
              userId,
            })
            .execute();
        });
      });
    console.log('WebSocket initialized ✔️');
  }
}

export default new SocketService();
