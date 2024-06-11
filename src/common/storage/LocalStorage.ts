import { IStorage } from './IStorage';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

class LocalStorage implements IStorage {
  private static instance: LocalStorage;

  private constructor() {}

  public static getInstance(): LocalStorage {
    if (!LocalStorage.instance) {
      LocalStorage.instance = new LocalStorage();
    }
    return LocalStorage.instance;
  }

  public async uploadFile(
    fileName: string,
    buffer: Buffer,
    mime: string
  ): Promise<string> {
    const devPath = path.join(process.env.DEV_MEDIA_PATH!, fileName);
    console.log(devPath);
    
    fs.writeFileSync(devPath, buffer);

    return fileName;
  }

  public async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(process.env.DEV_MEDIA_PATH!, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  public async processAndUploadImage(
    imageBuffer: Buffer,
    fileName?: string
  ): Promise<string> {
    if (!fileName) {
      fileName = `images/image-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.jpeg`;
    }
    const processedImage = await sharp(imageBuffer)
      .toFormat('jpeg')
      .resize(500, 500)
      .jpeg({ quality: 90 })
      .toBuffer();

    return this.uploadFile(fileName, processedImage, 'image/jpeg');
  }

  public async processAndUploadGif(
    gifBuffer: Buffer,
    fileName?: string
  ): Promise<string> {
    if (!fileName) {
      fileName = `gifs/gif-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`;
    }
    return this.uploadFile(fileName, gifBuffer, 'image/gif');
  }

  public async uploadVideo(
    videoBuffer: Buffer,
    fileName?: string
  ): Promise<string> {
    if (!fileName) {
      fileName = `reels/reels-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.jpeg`;
    }
    return this.uploadFile(fileName, videoBuffer, 'video/mp4');
  }
}

export default LocalStorage;
