import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
    try {
      const objectName = `${Date.now() + file.originalname}`;
      await new AWS.S3().putObject({
        Body: file.buffer,
        Bucket: process.env.S3_BUCKET_NAME,
        Key: objectName,
        ACL: 'public-read',
      });
      const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazone.com/${objectName}`;
      return { url: fileUrl };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
