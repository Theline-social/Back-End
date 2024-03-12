import { AppError, filterUser, getPartialUserProfile } from '../common';
import { AppDataSource } from '../dataSource';
import { Conversation, User } from '../entities';

export class ChatService {
  constructor() {}

  startConversation = async (userId: number, body: { username: string }) => {
    const { username } = body;
    const conversationRepository = AppDataSource.getRepository(Conversation);
    const userRepository = AppDataSource.getRepository(User);

    const existingConversation = await conversationRepository.exists({
      where: [
        { user1: { userId }, user2: { username } },
        { user1: { username }, user2: { userId } },
      ],
    });

    if (existingConversation) throw new AppError('Chat already exists', 400);

    const user1 = new User();
    user1.userId = userId;

    const user2 = await userRepository.findOne({
      where: { username },
      select: {
        followers: { userId: true },
        following: { userId: true },
        muted: { userId: true },
        blocked: { userId: true },
      },
      relations: {
        followers: true,
        following: true,
        muted: true,
        blocked: true,
      },
    });

    const newConversation = new Conversation();
    newConversation.user1 = user1;
    newConversation.user2 = user2 as User;
    newConversation.isUsersActive = {};
    newConversation.isUsersActive[`userId_${userId}`] = false;
    newConversation.isUsersActive[`userId_${user2?.userId}`] = false;

    const savedchat = await conversationRepository.save(newConversation);

    return {
      conversation: {
        conversationId: savedchat.conversationId,
        isActive: false,
        othercontact: getPartialUserProfile(user2 as User, userId),
      },
    };
  };

  exists = async (conversationId: number): Promise<boolean> => {
    return await AppDataSource.getRepository(Conversation).exists({
      where: { conversationId },
    });
  };

  getUnseenConversationsCnt = async (userId: number) => {
    const conversationRepository = AppDataSource.getRepository(Conversation);

    const count = await conversationRepository.count({
      where: [
        { user1: { userId }, messages: { isSeen: false } },
        { user2: { userId }, messages: { isSeen: false } },
      ],
    });

    return { count };
  };

  getConversationHistory = async (userId: number, conversationId: number) => {
    const conversationRepository = AppDataSource.getRepository(Conversation);

    const conversation = await conversationRepository.findOne({
      where: { conversationId },
      relations: {
        messages: true,
        user1: { followers: true, following: true, blocked: true, muted: true },
        user2: { followers: true, following: true, muted: true, blocked: true },
      },
      order: { messages: { createdAt: 'ASC' } },
    });

    if (!conversation) throw new AppError('conversation not found', 404);

    const otherContact =
      conversation.user1.userId === userId
        ? conversation.user2
        : conversation.user1;

    return {
      otherContact: getPartialUserProfile(otherContact, userId),
      messages: conversation.messages.map((message) => ({
        senderId: message.senderId,
        messageId: message.messageId,
        conversationId: conversation.conversationId,
        isSeen: message.isSeen,
        createdAt: message.createdAt,
        text: message.text,
        isFromMe: message.senderId === userId,
      })),
    };
  };

  getConversations = async (userId: number) => {
    const conversationRepository = AppDataSource.getRepository(Conversation);

    const conversations = await conversationRepository.find({
      where: [{ user1: { userId } }, { user2: { userId } }],
      relations: {
        messages: true,
        user1: { followers: true, following: true, blocked: true, muted: true },
        user2: { followers: true, following: true, muted: true, blocked: true },
      },
    });

    return {
      conversations: conversations.map((conversation): any => {
        const otherContact =
          conversation.user1.userId === userId
            ? conversation.user2
            : conversation.user1;

        const unseenCount = conversation.messages.reduce((count, message) => {
          return (
            count + (message.receiverId === userId && !message.isSeen ? 1 : 0)
          );
        }, 0);

        return {
          conversationId: conversation.conversationId,
          unseenCount,
          isActive: conversation.isUsersActive[`userId_${otherContact.userId}`],
          otherContact: getPartialUserProfile(otherContact, userId),
        };
      }),
    };
  };

  leaveConversation = async () => {};
}
