import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';
import { CreateStudentDto } from './dtos/create-student.dto';
import { UpdateStudentDto } from './dtos/update-student.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Student)
        private readonly studentRepo: Repository<Student>,
    ) { }

    async createStudent(dto: CreateStudentDto): Promise<HttpResponseInterface<Student>> {
        const student = this.studentRepo.create(dto);
        await this.studentRepo.save(student);
        return {
            statusCode: 201,
            message: 'Student created successfully',
            data: student,
        };
    }

    async getAllStudents(): Promise<HttpResponseInterface<Student[]>> {
        const students = await this.studentRepo.find();
        return {
            statusCode: 200,
            message: 'Students retrieved',
            data: students,
        };
    }

    async getStudentById(id: number): Promise<HttpResponseInterface<Student>> {
        const student = await this.studentRepo.findOne({ where: { student_id: id } });
        if (!student) throw new NotFoundException('Student not found');

        return {
            statusCode: 200,
            message: 'Student found',
            data: student,
        };
    }

    async updateStudent(id: number, dto: UpdateStudentDto): Promise<HttpResponseInterface<Student>> {
        const student = await this.studentRepo.findOne({ where: { student_id: id } });
        if (!student) throw new NotFoundException('Student not found');

        Object.assign(student, dto);
        await this.studentRepo.save(student);

        return {
            statusCode: 200,
            message: 'Student updated successfully',
            data: student,
        };
    }

    async deleteStudent(id: number): Promise<HttpResponseInterface<null>> {
        const result = await this.studentRepo.delete({ student_id: id });
        if (!result.affected) throw new NotFoundException('Student not found');

        return {
            statusCode: 200,
            message: 'Student deleted successfully',
            data: null,
        };
    }
}
