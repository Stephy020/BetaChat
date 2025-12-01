import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

let s3Client = null;

const getS3Client = () => {
    if (!s3Client) {
        console.log('Creating S3 Client with:');
        console.log('Region:', process.env.AWS_REGION);
        console.log('Bucket:', process.env.S3_BUCKET_NAME);
        console.log('Access Key exists:', !!process.env.AWS_ACCESS_KEY_ID);

        s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    return s3Client;
};

export const getSignedUploadUrl = async (userId, fileName, fileType) => {
    const s3 = getS3Client();
    const key = `${userId}/${uuidv4()}-${fileName}`;
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    });

    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { signedUrl, key, publicUrl };
};

export const deleteObject = async (key) => {
    const s3 = getS3Client();
    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    });
    await s3.send(command);
};
