import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../common';
import { ChatService } from '../services/chat.service';

const chatService = new ChatService();

export const startConversation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { conversation } = await chatService.startConversation(
      userId,
      req.body
    );

    res.status(201).json({
      status: true,
      message: 'Chat conversation created successfully',
      data: { conversation },
    });
  }
);

export const getUnseenConversationsCnt = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { count } = await chatService.getUnseenConversationsCnt(userId);

    res.status(201).json({
      status: true,
      data: { count },
    });
  }
);

export const getConversationHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { page, limit } = req.query;

    const { messages, otherContact, isBlockedByOtherContact } =
      await chatService.getConversationHistory(
        userId,
        +req.params.conversationId,
        +(page as string) || 1,
        +(limit as string) || 10
      );

    res.status(201).json({
      status: true,
      data: { otherContact, isBlockedByOtherContact, messages },
    });
  }
);

export const getConversations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.currentUser.userId;

    const { page, limit } = req.query;

    const { conversations } = await chatService.getConversations(
      userId,
      +(page as string) || 1,
      +(limit as string) || 10
    );

    res.status(201).json({
      status: true,
      data: { conversations },
    });
  }
);
