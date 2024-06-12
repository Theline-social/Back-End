import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import http from 'http'; // Import the 'http' module
import https from 'https'; // Import the 'https' module
import fs from 'fs'; // Import the 'fs' module
import app from './app';
import socketService from './services/socket.service';
import { AppDataSource } from './dataSource';
import {
  deleteOldNotificationJob,
  deleteTerminatedTagsJob,
} from './common/cronJobs';

process.on('uncaughtException', (err: Error) => {
  console.log('uncaught exception'.toUpperCase(), ',Shutting down......');
  console.log(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 2000;

let server: http.Server | https.Server;

(async () => {
  try {
    await AppDataSource.initialize();
    if (AppDataSource.isInitialized) {
      console.log('DB connection established ✔️');

      // Read SSL/TLS certificates only if NODE_ENV is 'production'
      let serverCreator;
      if (process.env.NODE_ENV === 'productio') {
        const privateKey = fs.readFileSync(
          '/etc/letsencrypt/live/theline.social/privkey.pem',
          'utf8'
        );
        const certificate = fs.readFileSync(
          '/etc/letsencrypt/live/theline.social/cert.pem',
          'utf8'
        );
        const ca = fs.readFileSync('/path/to/ca_bundle.crt', 'utf8'); // If you have CA bundle

        const credentials = {
          key: privateKey,
          cert: certificate,
          ca: ca,
        };
        serverCreator = () => https.createServer(credentials, app);
      } else {
        serverCreator = () => http.createServer(app);
      }

      server = serverCreator().listen(PORT, () => {
        console.log(`Server listening on port ${PORT} 🚀`);
      });

      socketService.initializeSocket(server, AppDataSource);

      deleteOldNotificationJob.start();
      deleteTerminatedTagsJob.start();
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
