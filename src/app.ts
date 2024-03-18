import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { AppError, swaggerSpec } from './common';
import { globalErrorHandler } from './controllers';
import { authRouter } from './routes/auth.router';
import { usersRouter } from './routes/user.router';
import { tweetsRouter } from './routes/tweet.router';
import { interactionsRouter } from './routes/interaction.router';
import { reelsRouter } from './routes/reel.router';
import { topicsRouter } from './routes/topic.router';
import { notificationsRouter } from './routes/notification.router';
import { tagsRouter } from './routes/tag.router';
import { chatRouter } from './routes/chat.router';

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Set security HTTP headers
app.use(helmet());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(compression());

// Limit the traffic => prevent DoS attacks
const limiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, // 60 minutes
  max: 10000, // Limit each IP to 300 requests per `window` (here, per 60 minutes)
  message: {
    message: 'Too many requests, try again in an hour',
    status: 'warning',
  },
});

// Apply the rate limiting middleware to API calls only
app.use('/api', limiter);

app.use(cors({ origin: true, credentials: true }));

// Just a testing middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  //   req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/tweets', tweetsRouter);
app.use('/api/v1/users/current', interactionsRouter);
app.use('/api/v1/users/current', notificationsRouter);
app.use('/api/v1/reels', reelsRouter);
app.use('/api/v1/topics', topicsRouter);
app.use('/api/v1/tags', tagsRouter);
app.use('/api/v1/chats', chatRouter);

// Swagger
app.use('/api/v1/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Docs in JSON format
app.get('/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
