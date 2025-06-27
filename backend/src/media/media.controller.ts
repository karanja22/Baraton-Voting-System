import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const studentId = req.user?.identifier;
    const result = await this.mediaService.uploadStudentImage(file, studentId);

    return {
      statusCode: 201,
      message: 'Profile image uploaded successfully',
      data: result,
    };
  }
}
