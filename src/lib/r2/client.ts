import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function isR2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL
  );
}

function getR2Client() {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured. Avatar uploads are disabled.");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export function validateUpload(fileType: string, fileSize: number) {
  if (!ALLOWED_TYPES.includes(fileType)) {
    return { valid: false, error: "File type must be JPEG, PNG, or WebP" };
  }
  if (fileSize > MAX_SIZE_BYTES) {
    return { valid: false, error: "File size must be less than 5MB" };
  }
  return { valid: true, error: null };
}

export async function generatePresignedUploadUrl(
  userId: string,
  fileType: string,
  fileSize: number
) {
  const client = getR2Client();
  const ext = fileType.split("/")[1] === "jpeg" ? "jpg" : fileType.split("/")[1];
  const key = `avatars/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl, key };
}

export async function deleteR2Object(key: string) {
  const client = getR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
}

export function extractKeyFromUrl(url: string): string | null {
  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!publicBase || !url.startsWith(publicBase)) return null;
  return url.slice(publicBase.length + 1); // +1 for the slash
}
