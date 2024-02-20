import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import http, { createServer } from 'http';
import app from './app';
import socketService from './services/socket.service';
import { AppDataSource } from './dataSource';

process.on('uncaughtException', (err: Error) => {
  console.log('uncaught exception'.toUpperCase(), ',Shutting down......');
  console.log(err.name, err.message);
  process.exit(1);
});



const PORT = process.env.PORT || 2000;

let server: http.Server;

(async () => {
  try {
    await AppDataSource.initialize();
    if (AppDataSource.isInitialized) {
      console.log('DB connection established ✔️');
      server = createServer(app).listen(PORT, () => {
        console.log(`HTTP Express server listening on port ${PORT} 🫡`);
      });

      socketService.initializeSocket(server, AppDataSource);
    }
  } catch (err) {
    console.log((err as Error).name, (err as Error).message);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (err: Error) => {
  console.log('Unhandled Rejection'.toUpperCase(), ',Shutting down....');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
