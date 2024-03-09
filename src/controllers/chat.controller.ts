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

    const { messages } = await chatService.getConversationHistory(
      userId,
      +req.params.conversationId
    );

    res.status(201).json({
      status: true,
      data: { messages },
    });
  }
);
