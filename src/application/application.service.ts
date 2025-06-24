import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(CandidateApplication)
    private candidateRepo: Repository<CandidateApplication>,

    @InjectRepository(DelegateApplication)
    private delegateRepo: Repository<DelegateApplication>,

    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
  ) { }
  async submitDelegateApplication(dto: CreateDelegateDto): Promise<HttpResponseInterface<any>> {
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

    const mismatch =
      dto.email !== student.email ||
      dto.school_id !== student.school?.id ||
      dto.department_id !== student.department?.id ||
      dto.program_id !== student.program?.id;

    if (mismatch) {
      return {
        statusCode: 400,
        message: 'Provided data does not match student records',
        data: null,
      };
    }

    const delegate = this.delegateRepo.create({
      ...dto,
      full_name: `${student.first_name} ${student.last_name}`,
      school: student.school?.name,
      department: student.department?.name,
      tribe: student.tribe,
      gender: student.gender,
      gpa: student.gpa,
      year_of_study: student.year_of_study,
      major: student.program?.name,
      has_disciplinary_issue: false,
      credit_hours: student.credit_hours,
      status: 'pending',
    });

    await this.delegateRepo.save(delegate);
    return {
      statusCode: 201,
      message: 'Delegate application submitted successfully',
      data: delegate,
    };
  }

  async submitCandidateApplication(dto: CreateCandidateDto): Promise<HttpResponseInterface<any>> {
    const candidateStudent = await this.studentRepo.findOne({
      where: { student_id: dto.student_id },
      relations: ['school', 'department', 'program', 'residence'],
    });

    if (!candidateStudent) {
      return {
        statusCode: 400,
        message: 'Student not found',
        data: null,
      };
    }

    let vicePresidentData: Student | null = null;

    // Handle vice president ID logic
    if (dto.vice_president_id) {
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

    const candidate = this.candidateRepo.create({
      ...dto,
      email: candidateStudent.email,
      school: candidateStudent.school?.name,
      department: candidateStudent.department?.name,
      tribe: candidateStudent.tribe,
      gender: candidateStudent.gender,
      gpa: candidateStudent.gpa,
      year_of_study: candidateStudent.year_of_study,
      major: candidateStudent.program?.name,
      nationality: candidateStudent.nationality,
      credit_hours: candidateStudent.credit_hours,
      has_disciplinary_issue: candidateStudent.hasDisciplinaryIssues,
      status: 'pending',
      vice_president: vicePresidentData || undefined
    });

    candidate.full_name = `${candidateStudent.first_name} ${candidateStudent.last_name}`;

    await this.candidateRepo.save(candidate);

    return {
      statusCode: 201,
      message: 'Candidate application submitted',
      data: {
        ...candidate,
        vice_president_details: vicePresidentData ? {
          full_name: `${vicePresidentData.first_name} ${vicePresidentData.last_name}`,
          student_id: vicePresidentData.student_id,
          school: vicePresidentData.school?.name,
          department: vicePresidentData.department?.name,
          program: vicePresidentData.program?.name,
          gender: vicePresidentData.gender,
          nationality: vicePresidentData.nationality,
          gpa: vicePresidentData.gpa,
          year_of_study: vicePresidentData.year_of_study,
          credit_hours: vicePresidentData.credit_hours,
          email: vicePresidentData.email,
        } : null
      }
    };
  }

  async getAllCandidates(): Promise<HttpResponseInterface<any>> {
    const candidates = await this.candidateRepo.find();
    return {
      statusCode: 200,
      message: 'All candidates fetched',
      data: candidates,
    };
  }

  async getCandidateById(id: number): Promise<HttpResponseInterface<any>> {
    const candidate = await this.candidateRepo.findOne({ where: { id } });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return {
      statusCode: 200,
      message: 'Candidate found',
      data: candidate,
    };
  }

  async getAllDelegates(): Promise<HttpResponseInterface<any>> {
    const delegates = await this.delegateRepo.find();
    return {
      statusCode: 200,
      message: 'All delegates fetched',
      data: delegates,
    };
  }

  async getDelegateById(id: number): Promise<HttpResponseInterface<any>> {
    const delegate = await this.delegateRepo.findOne({ where: { id } });
    if (!delegate) throw new NotFoundException('Delegate not found');
    return {
      statusCode: 200,
      message: 'Delegate found',
      data: delegate,
    };
  }

  // ========== UPDATE ==========
  async updateCandidate(id: number, dto: UpdateCandidateDto): Promise<HttpResponseInterface<any>> {
    const candidate = await this.candidateRepo.findOne({ where: { id } });
    if (!candidate) throw new NotFoundException('Candidate not found');

    Object.assign(candidate, dto);
    await this.candidateRepo.save(candidate);

    return {
      statusCode: 200,
      message: 'Candidate updated successfully',
      data: candidate,
    };
  }

  async updateDelegate(id: number, dto: UpdateDelegateDto): Promise<HttpResponseInterface<any>> {
    const delegate = await this.delegateRepo.findOne({ where: { id } });
    if (!delegate) throw new NotFoundException('Delegate not found');

    Object.assign(delegate, dto);
    await this.delegateRepo.save(delegate);

    return {
      statusCode: 200,
      message: 'Delegate updated successfully',
      data: delegate,
    };
  }

  // ========== DELETE ==========
  async deleteCandidate(id: number): Promise<HttpResponseInterface<any>> {
    const candidate = await this.candidateRepo.findOne({ where: { id } });
    if (!candidate) throw new NotFoundException('Candidate not found');

    await this.candidateRepo.remove(candidate);
    return {
      statusCode: 200,
      message: 'Candidate deleted successfully',
      data: null,
    };
  }

  async deleteDelegate(id: number): Promise<HttpResponseInterface<any>> {
    const delegate = await this.delegateRepo.findOne({ where: { id } });
    if (!delegate) throw new NotFoundException('Delegate not found');

    await this.delegateRepo.remove(delegate);
    return {
      statusCode: 200,
      message: 'Delegate deleted successfully',
      data: null,
    };
  }

  async reviewCandidate(id: number): Promise<HttpResponseInterface<any>> {
    const candidate = await this.candidateRepo.findOne({
      where: { id },
      relations: ['position'],
    });

    if (!candidate) throw new NotFoundException('Candidate application not found');

    const {
      gpa,
      credit_hours,
      position,
      residence,
      school,
      department,
      nationality,
      has_disciplinary_issue,
    } = candidate;

    let approved = true;

    if (has_disciplinary_issue) approved = false;
    if (gpa < 2.5 || credit_hours < 54 || credit_hours > 100) approved = false;

    const positionName = position?.name?.toLowerCase();

    if (positionName === 'president' || position.isVicePosition) {
      if (credit_hours < 60) approved = false;
    }

    if (positionName?.includes('senator residence')) {
      const validResidences = [
        "Men's Dorm",
        "Ladies' Dorm",
        'Off Campus Male',
        'Off Campus Female',
      ];
      approved &&= validResidences.includes(residence);
    } else if (positionName?.includes('senator school of')) {
      approved &&= Boolean(school);
    } else if (positionName === 'senator religious affairs') {
      approved &&= department?.toLowerCase().includes('theology');
    } else if (positionName === 'senator international rep') {
      approved &&= nationality?.toLowerCase() !== 'kenyan';
    }

    candidate.status = approved ? 'approved' : 'rejected';
    await this.candidateRepo.save(candidate);

    return {
      statusCode: 200,
      message: `Candidate application ${candidate.status}`,
      data: candidate,
    };
  }

  async reviewDelegate(id: number): Promise<HttpResponseInterface<any>> {
    const delegate = await this.delegateRepo.findOne({ where: { id } });
    if (!delegate) throw new NotFoundException('Delegate application not found');

    const approved =
      delegate.gpa >= 2.5 &&
      delegate.credit_hours >= 54 &&
      !delegate.has_disciplinary_issue &&
      delegate.status === 'pending';

    delegate.status = approved ? 'approved' : 'rejected';
    await this.delegateRepo.save(delegate);

    return {
      statusCode: 200,
      message: `Delegate application ${delegate.status}`,
      data: delegate,
    };
  }
}
