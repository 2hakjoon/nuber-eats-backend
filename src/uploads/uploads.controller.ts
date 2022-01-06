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
    const s3 = new AWS.S3({
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: 'ap-northeast-2',
    });
    try {
      const objectName = `${Date.now() + file.originalname}`;
      await s3.putObject(
        {
          Body: file.buffer,
          Bucket: process.env.S3_BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read',
        },
        (err, data) => {
          if (err) {
            console.log(err);
          }
        },
      );
      return {
        url: `https://${process.env.S3_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/${objectName}`,
      };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
