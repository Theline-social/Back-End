export interface IStorage {
  processAndUploadImage(imageBuffer: Buffer, fileName: string): Promise<string>;
  processAndUploadGif(gifBuffer: Buffer, fileName: string): Promise<string>;
  uploadVideo(videoBuffer: Buffer, fileName: string): Promise<string>;
  deleteFile(fileId: string): Promise<void>;
}
