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

    const uploadResponse = await this.b2.uploadFile({
      uploadUrl: uploadUrl.uploadUrl,
      uploadAuthToken: uploadUrl.authorizationToken,
      fileName,
      data: fileBuffer,
      mime: mimeType,
    });

    return uploadResponse.data.fileId;
  }

  public async processAndUploadImage(
    imageBuffer: Buffer,
    fileName: string
  ): Promise<string> {
    const processedImage = await sharp(imageBuffer)
      .toFormat('jpeg')
      .resize(500, 500)
      .jpeg({ quality: 90 })
      .toBuffer();

    return this.uploadFile(fileName, processedImage, 'image/jpeg');
  }

  public async processAndUploadGif(
    gifBuffer: Buffer,
    fileName: string
  ): Promise<string> {
    return this.uploadFile(fileName, gifBuffer, 'image/gif');
  }

  public async uploadVideo(
    videoBuffer: Buffer,
    fileName: string
  ): Promise<string> {
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
}

export default BackblazeStorage;