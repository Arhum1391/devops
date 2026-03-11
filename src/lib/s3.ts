import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Validate required environment variables
if (!process.env.AWS_S3_BUCKET_NAME) {
  throw new Error('Please add AWS_S3_BUCKET_NAME to .env.local');
}

if (!process.env.AWS_S3_REGION) {
  throw new Error('Please add AWS_S3_REGION to .env.local');
}

if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error('Please add AWS_ACCESS_KEY_ID to .env.local');
}

if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('Please add AWS_SECRET_ACCESS_KEY to .env.local');
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

/**
 * Extract meaningful error message from AWS SDK error
 * @param error - The error object from AWS SDK
 * @param defaultMessage - Default error message if extraction fails
 * @returns A detailed error message
 */
function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    // Check if it's an AWS SDK error with name property
    const awsError = error as Error & { name?: string; $metadata?: { httpStatusCode?: number } };
    
    if (awsError.name) {
      // AWS SDK errors often have a name property (e.g., 'AccessDenied', 'InvalidAccessKeyId', 'NoSuchBucket')
      const errorName = awsError.name;
      const errorMessage = awsError.message || '';
      const statusCode = awsError.$metadata?.httpStatusCode;
      
      // Build a detailed error message
      let detailedMessage = `${defaultMessage}: ${errorName}`;
      if (errorMessage) {
        detailedMessage += ` - ${errorMessage}`;
      }
      if (statusCode) {
        detailedMessage += ` (HTTP ${statusCode})`;
      }
      
      return detailedMessage;
    }
    
    // Fallback to error message if available
    return `${defaultMessage}: ${error.message}`;
  }
  
  // Fallback for non-Error objects
  return `${defaultMessage}: ${String(error)}`;
}

/**
 * Upload a file to S3
 * @param fileBuffer - The file buffer to upload
 * @param fileName - The name/path for the file in S3
 * @param contentType - MIME type of the file (e.g., 'image/png', 'image/jpeg')
 * @returns The S3 key (path) of the uploaded file
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return fileName;
  } catch (error) {
    console.error('S3 upload error:', error);
    const errorMessage = extractErrorMessage(error, 'Failed to upload file to S3');
    throw new Error(errorMessage);
  }
}

/**
 * Delete a file from S3
 * @param fileName - The S3 key (path) of the file to delete
 */
export async function deleteFile(fileName: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('S3 delete error:', error);
    const errorMessage = extractErrorMessage(error, 'Failed to delete file from S3');
    throw new Error(errorMessage);
  }
}

/**
 * Get a public URL for a file in S3
 * This assumes the bucket has public read access or the file has public ACL
 * @param fileName - The S3 key (path) of the file
 * @returns The public URL of the file
 */
export function getFileUrl(fileName: string): string {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileName}`;
}

/**
 * Get a presigned URL for a private file in S3
 * This URL will be valid for a specified duration (default 1 hour)
 * @param fileName - The S3 key (path) of the file
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns A presigned URL that provides temporary access to the file
 */
export async function getPresignedUrl(
  fileName: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('S3 presigned URL error:', error);
    const errorMessage = extractErrorMessage(error, 'Failed to generate presigned URL');
    throw new Error(errorMessage);
  }
}

