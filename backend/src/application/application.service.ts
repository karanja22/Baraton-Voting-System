import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDelegateDto } from './dto/create-delegate.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CandidateApplication } from './entities/candidate-application.entity';
import { DelegateApplication } from './entities/delegate-application.entity';
import { Student } from 'src/users/entities/student.entity';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';
import { UpdateCandidateDto } from './dto/update-candidtate.dto';
import { UpdateDelegateDto } from './dto/update-delegate.dto';
import { Position } from 'src/shared/entities/position.entity';
import { Election } from 'src/elections/entities/election.entity';
import { Residence } from 'src/shared/entities/residence.entity';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(CandidateApplication)
    private candidateRepo: Repository<CandidateApplication>,

    @InjectRepository(DelegateApplication)
    private delegateRepo: Repository<DelegateApplication>,

    @InjectRepository(Student)
    private studentRepo: Repository<Student>,

    @InjectRepository(Position)
    private positionRepo: Repository<Position>,

    @InjectRepository(Election)
    private electionRepo: Repository<Election>,

    @InjectRepository(Residence)
    private residenceRepo: Repository<Residence>,

    private readonly mediaService: MediaService,
  ) { }

  async submitCandidateApplication(
    dto: CreateCandidateDto,
    file?: Express.Multer.File,
  ): Promise<HttpResponseInterface<any>> {
    const student = await this.studentRepo.findOne({
      where: { student_id: dto.student_id },
      relations: ['school', 'department', 'program', 'residence'],
    });

    if (!student) {
      return {
        statusCode: 404,
        message: 'Student not found',
        data: null,
      };
    }

    const existingCandidate = await this.candidateRepo.findOne({
      where: { student: { student_id: dto.student_id } },
    });

    if (existingCandidate) {
      return {
        statusCode: 400,
        message: 'You have already applied as a candidate.',
        data: null,
      };
    }

    const existingDelegate = await this.delegateRepo.findOne({
      where: { student: { student_id: dto.student_id } },
    });

    if (existingDelegate) {
      return {
        statusCode: 400,
        message: 'You cannot apply as a candidate after applying as a delegate.',
        data: null,
      };
    }

    const position = await this.positionRepo.findOne({
      where: { id: dto.position_id },
      relations: ['election'],
    });

    if (!position) {
      return {
        statusCode: 400,
        message: 'Position not found',
        data: null,
      };
    }

    const election = position.election;

    if (election.id !== dto.election_id) {
      return {
        statusCode: 400,
        message: 'Position does not belong to the specified election',
        data: null,
      };
    }

    const isPresidentPosition = position.name.toLowerCase() === 'president';
    let vicePresidentData: Student | null = null;

    if (dto.vice_president_id) {
      if (!isPresidentPosition) {
        return {
          statusCode: 400,
          message: 'Vice president can only be assigned to the President position',
          data: null,
        };
      }

      vicePresidentData = await this.studentRepo.findOne({
        where: { student_id: dto.vice_president_id },
        relations: ['school', 'department', 'program', 'residence'],
      });

      if (!vicePresidentData) {
        return {
          statusCode: 400,
          message: 'Vice president student ID not found',
          data: null,
        };
      }
    }

    if (file) {
      const uploaded = await this.mediaService.uploadStudentImage(file, student.student_id);
      student.photo_url = uploaded.photo_url;
      student.cloudinary_public_id = uploaded.public_id;
      await this.studentRepo.save(student);
    }

    const candidate = this.candidateRepo.create({
      student: student,
      full_name: `${student.first_name} ${student.last_name}`,
      email: student.email,
      school: student.school,
      department: student.department,
      major: student.program,
      tribe: student.tribe,
      gender: student.gender,
      gpa: student.gpa,
      year_of_study: student.year_of_study,
      nationality: student.nationality,
      credit_hours: student.credit_hours,
      has_disciplinary_issue: student.hasDisciplinaryIssues,
      status: 'pending',
      residence: student.residence,
      position: position,
      election: election,
      vice_president: isPresidentPosition ? vicePresidentData : undefined,
    } as any);

    await this.candidateRepo.save(candidate);

    return {
      statusCode: 201,
      message: 'Candidate application submitted successfully',
      data: candidate,
    };
  }

  async submitDelegateApplication(dto: CreateDelegateDto): Promise<HttpResponseInterface<any>> {
    const student = await this.studentRepo.findOne({
      where: { student_id: dto.student_id },
      relations: ['school', 'department', 'program'],
    });

    if (!student) {
      return {
        statusCode: 404,
        message: 'Student not found',
        data: null,
      };
    }

    const existingDelegate = await this.delegateRepo.findOne({
      where: { student: { student_id: dto.student_id } },
    });

    if (existingDelegate) {
      return {
        statusCode: 400,
        message: 'You have already applied as a delegate.',
        data: null,
      };
    }

    const existingCandidate = await this.candidateRepo.findOne({
      where: { student: { student_id: dto.student_id } },
    });

    if (existingCandidate) {
      return {
        statusCode: 400,
        message: 'You cannot apply as a delegate after applying as a candidate.',
        data: null,
      };
    }

    const delegate = this.delegateRepo.create({
      student,
      full_name: `${student.first_name} ${student.last_name}`,
      email: student.email,
      school: student.school,
      department: student.department,
      tribe: student.tribe,
      gender: student.gender,
      gpa: student.gpa,
      year_of_study: student.year_of_study,
      program: student.program,
      has_disciplinary_issue: student.hasDisciplinaryIssues,
      credit_hours: student.credit_hours,
      status: 'pending',
    } as any);

    await this.delegateRepo.save(delegate);

    return {
      statusCode: 201,
      message: 'Delegate application submitted successfully',
      data: delegate,
    };
  }

  async getAllDelegates() {
    return this.delegateRepo.find({ relations: ['student', 'school', 'department', 'program'] });
  }

  async getAllCandidates() {
    return this.candidateRepo.find({ relations: ['student', 'position', 'election', 'residence'] });
  }

  async getDelegateById(id: number) {
    return this.delegateRepo.findOne({ where: { id }, relations: ['student', 'school', 'department', 'program'] });
  }

  async getCandidateById(id: number) {
    return this.candidateRepo.findOne({ where: { id }, relations: ['student', 'position', 'election', 'residence'] });
  }

  async updateDelegate(id: number, dto: UpdateDelegateDto) {
    // Remove student_id from dto as it's not a property of DelegateApplication
    const { student_id, ...rest } = dto;
    const updateData: Partial<DelegateApplication> = { ...rest };
    await this.delegateRepo.update(id, updateData);
    return this.getDelegateById(id);
  }

  async updateCandidate(id: number, dto: UpdateCandidateDto) {
    await this.candidateRepo.update(id, dto);
    return this.getCandidateById(id);
  }

  async deleteDelegate(id: number) {
    await this.delegateRepo.delete(id);
    return { message: 'Delegate deleted successfully' };
  }

  async deleteCandidate(id: number) {
    await this.candidateRepo.delete(id);
    return { message: 'Candidate deleted successfully' };
  }
}
