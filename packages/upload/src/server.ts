import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  isAllowedMimeType,
  type AllowedMimeType,
} from "@sungano-group/upload/constants";

export { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE, isAllowedMimeType };
export type { AllowedMimeType };

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

export function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export interface PresignResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Generate a presigned PUT URL for R2.
 * @param config   R2 configuration
 * @param filename Original filename from the client
 * @param mimeType Content-type of the file
 * @param folder   Optional folder prefix (default: "uploads")
 * @param expiresIn  Seconds until the presigned URL expires (default: 120)
 */
export async function createPresignedUploadUrl(
  config: R2Config,
  filename: string,
  mimeType: string,
  folder = "uploads",
  expiresIn = 120,
): Promise<PresignResult> {
  if (!isAllowedMimeType(mimeType)) {
    throw new Error(`File type "${mimeType}" is not allowed.`);
  }

  const client = createR2Client(config);
  const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });
  const publicUrl = `${config.publicUrl.replace(/\/$/, "")}/${key}`;

  return { uploadUrl, publicUrl, key };
}
