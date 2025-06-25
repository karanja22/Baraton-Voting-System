import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dtos/create-student.dto';
import { UpdateStudentDto } from './dtos/update-student.dto';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';
import { Program } from 'src/shared/entities/program.entity';
import { Department } from 'src/shared/entities/department.entity';
import { Residence } from 'src/shared/entities/residence.entity';
import { School } from 'src/shared/entities/school.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(Residence)
    private readonly residenceRepo: Repository<Residence>,
  ) { }

  async createStudent(dto: CreateStudentDto): Promise<HttpResponseInterface<Student>> {
    const program = await this.programRepo.findOne({ where: { id: dto.program_id } });
    const department = await this.deptRepo.findOne({ where: { id: dto.department_id } });
    const school = await this.schoolRepo.findOne({ where: { id: dto.school_id } });
    const residence = dto.residence_id
      ? await this.residenceRepo.findOne({ where: { id: dto.residence_id } })
      : null;

    if (!program || !department || !school) {
      throw new NotFoundException('One or more related entities (program, department, school) not found');
    }
    const maleResidences = ["Men's Dorm", 'Off Campus Male'];
    const femaleResidences = ['Ladies\' Dorm', 'Off Campus Female'];
    const gender = dto.gender?.toLowerCase();

    if (residence && gender === 'male' && femaleResidences.includes(residence.name)) {
      throw new BadRequestException('Male students cannot be assigned to female residences');
    }

    if (residence && gender === 'female' && maleResidences.includes(residence.name)) {
      throw new BadRequestException('Female students cannot be assigned to male residences');
    }

    const student = this.studentRepo.create({
      ...dto,
      program,
      department,
      school,
      residence,
    });

    await this.studentRepo.save(student);

    return {
      statusCode: 201,
      message: 'Student created successfully',
      data: student,
    };
  }

  async getAllStudents(): Promise<HttpResponseInterface<Student[]>> {
    const students = await this.studentRepo.find({
      relations: ['school', 'department', 'program', 'residence'],
    });

    return {
      statusCode: 200,
      message: 'Students retrieved',
      data: students,
    };
  }

  async getStudentById(id: number): Promise<HttpResponseInterface<Student>> {
    const student = await this.studentRepo.findOne({
      where: { student_id: id },
      relations: ['school', 'department', 'program', 'residence'],
    });

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

    if (dto.email && dto.email !== student.email) {
      const emailTaken = await this.studentRepo.findOne({ where: { email: dto.email } });
      if (emailTaken) {
        throw new BadRequestException('Email is already in use');
      }
    }

    if (dto.student_id && dto.student_id !== id) {
      const idTaken = await this.studentRepo.findOne({ where: { student_id: dto.student_id } });
      if (idTaken) {
        throw new BadRequestException('Student ID already exists');
      }
    }

    if (dto.program_id) {
      const program = await this.programRepo.findOne({ where: { id: dto.program_id } });
      if (program) student.program = program;
    }

    if (dto.department_id) {
      const dept = await this.deptRepo.findOne({ where: { id: dto.department_id } });
      if (dept) student.department = dept;
    }

    if (dto.school_id) {
      const school = await this.schoolRepo.findOne({ where: { id: dto.school_id } });
      if (school) student.school = school;
    }

    if (dto.residence_id !== undefined) {
      student.residence = dto.residence_id
        ? await this.residenceRepo.findOne({ where: { id: dto.residence_id } })
        : null;
    }

    const { program_id, department_id, school_id, residence_id, ...safeFields } = dto;
    Object.assign(student, safeFields);

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
