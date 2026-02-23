import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env";

const s3Client = env.R2_ACCOUNT_ID
  ? new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: env.R2_SECRET_ACCESS_KEY || "",
      },
    })
  : null;

export class StorageService {
  async getUploadUrl(key: string, contentType: string, maxSize: number) {
    if (!s3Client) {
      // Return mock URL for development
      return {
        uploadUrl: `${env.API_URL}/api/mock-upload/${key}`,
        key,
      };
    }

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ContentLength: maxSize,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return { uploadUrl, key };
  }

  async getDownloadUrl(key: string) {
    if (!s3Client) {
      return `${env.API_URL}/api/mock-download/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }

  async deleteFile(key: string) {
    if (!s3Client) return;

    const command = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  }

  generateKey(prefix: string, fileName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = fileName.split(".").pop()?.toLowerCase() || "bin";
    return `${prefix}/${timestamp}-${random}.${ext}`;
  }
}

export const storageService = new StorageService();
