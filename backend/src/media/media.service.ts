import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from 'src/users/entities/student.entity';

@Injectable()
export class MediaService {
    constructor(
        private configService: ConfigService,
        @InjectRepository(Student)
        private readonly studentRepo: Repository<Student>,
    ) {
        cloudinary.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadStudentImage(file: Express.Multer.File, studentId: number): Promise<{ photo_url: string; public_id: string }> {
        if (!file) throw new BadRequestException('No file uploaded');

        const student = await this.studentRepo.findOne({ where: { student_id: studentId } });
        if (!student) throw new NotFoundException('Student not found');

        const result = await this.uploadToCloudinary(file, `student_${studentId}`, 'baratonvote');

        student.photo_url = result.secure_url;
        student.cloudinary_public_id = result.public_id;
        await this.studentRepo.save(student);

        return {
            photo_url: result.secure_url,
            public_id: result.public_id,
        };
    }

    private uploadToCloudinary(file: Express.Multer.File, publicId: string, folder: string): Promise<{ secure_url: string; public_id: string }> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    public_id: publicId,
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result?.secure_url) return reject(new Error('Upload failed'));
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                    });
                }
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}
