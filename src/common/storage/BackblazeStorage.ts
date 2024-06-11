import BackblazeB2 from 'backblaze-b2';
import sharp from 'sharp';
import fs from 'fs';
import { IStorage } from './IStorage';

class BackblazeStorage implements IStorage {
  private static instance: BackblazeStorage;
  private b2: BackblazeB2;

  private constructor() {
    this.b2 = new BackblazeB2({
      applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
      applicationKey: process.env.B2_APPLICATION_KEY!,
    });
  }

  public static getInstance(): BackblazeStorage {
    if (!BackblazeStorage.instance) {
      BackblazeStorage.instance = new BackblazeStorage();
    }
    return BackblazeStorage.instance;
  }

  private async authorize() {
    await this.b2.authorize();
  }

  private async getUploadUrl() {
    const response = await this.b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID!,
    });
    return response.data;
  }

  public async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<string> {
    await this.authorize();
    const uploadUrl = await this.getUploadUrl();

    const response = await this.b2.uploadFile({
      uploadUrl: uploadUrl.uploadUrl,
      uploadAuthToken: uploadUrl.authorizationToken,
      fileName,
      data: fileBuffer,
      mime: mimeType,
    });
    console.log(response);

    const fileUrl = `https://f003.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${fileName}`;
    return fileUrl;
  }

  public async processAndUploadImage(
    imageBuffer: Buffer,
    fileName?: string
  ): Promise<string> {
    if (!fileName) {
      fileName = `images/user-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.jpeg`;
    }

    const processedImage = await sharp(imageBuffer)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    return this.uploadFile(fileName, processedImage, 'image/jpeg');
  }

  public async processAndUploadGif(
    gifBuffer: Buffer,
    fileName?: string
  ): Promise<string> {
    if (!fileName) {
      fileName = `gifs/gif-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.jpeg`;
    }
    return this.uploadFile(fileName, gifBuffer, 'image/gif');
  }

  public async uploadVideo(
    videoBuffer: Buffer,
    fileName?: string
  ): Promise<string> {
    if (!fileName) {
      fileName = `reels/reel-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.jpeg`;
    }
    return this.uploadFile(fileName, videoBuffer, 'video/mp4');
  }

  public async deleteFile(fileId: string): Promise<void> {
    await this.authorize();
    await this.b2.deleteFileVersion({
      fileId: fileId,
      fileName: fileId, // Assuming fileName is the same as fileId for simplicity.
    });
  }

  public async listFiles(
    prefix: string = '',
    maxFileCount: number = 100
  ): Promise<string[]> {
    await this.authorize();
    const response = await this.b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID!,
      prefix: prefix,
      maxFileCount: maxFileCount,
      startFileName: '', // Add this line
      delimiter: '', // Add this line
    });

    return response.data.files.map((file: any) => file.fileName);
  }

  public async generateAuthorizedUrl(
    fileName: string,
    validDurationInSeconds: number = 3600
  ): Promise<string> {
    await this.authorize();
    const response = await this.b2.getDownloadAuthorization({
      bucketId: process.env.B2_BUCKET_ID!,
      fileNamePrefix: fileName,
      validDurationInSeconds: validDurationInSeconds,
    });

    const downloadAuthToken = response.data.authorizationToken;
    const baseUrl = `https://f003.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${fileName}`;
    return `${baseUrl}?Authorization=${downloadAuthToken}`;
  }
}

export default BackblazeStorage;
