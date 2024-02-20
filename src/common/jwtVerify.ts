import jwt from 'jsonwebtoken';
import { Payload } from './types/payload';

export const jwtVerifyPromisified = (
  token: string,
  secret: string
): Promise<Payload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, {}, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload as Payload);
      }
    });
  });
};
