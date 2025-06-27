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
import { Position } from 'src/shared/entities/position.entity';
import { Election } from 'src/elections/entities/election.entity';
import { Residence } from 'src/shared/entities/residence.entity';

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
    private residenceRepo: Repository<Residence>
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

    // Prevent if already applied as a delegate
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

    // Prevent if already applied as a candidate
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

    const delegate = this.delegateRepo.create(Object.assign(new DelegateApplication(), {
      full_name: `${student.first_name} ${student.last_name}`,
      student: student,
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
    }));

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

    // Prevent double candidate application
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

    // Prevent if already a delegate
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

    // Only president should have VP
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

    // Match senator school with student's school
    if (position.name.toLowerCase().startsWith('senator school of')) {
      const schoolNameFromPosition = position.name.replace(/senator school of\s*/i, '').trim().toLowerCase();
      const schoolNameFromStudent = candidateStudent.school.name.replace(/school of\s*/i, '').trim().toLowerCase();

      if (schoolNameFromPosition !== schoolNameFromStudent) {
        return {
          statusCode: 400,
          message: `Position is for School of ${schoolNameFromPosition}, but student belongs to School of ${schoolNameFromStudent}`,
          data: null,
        };
      }
    }

    // Check if it's a "Senator Residence -" position
    if (position.name.toLowerCase().startsWith('senator residence -')) {
      const residenceNameFromPosition = position.name
        .replace(/senator residence -\s*/i, '')
        .trim()
        .toLowerCase();

      if (!candidateStudent.residence || !candidateStudent.residence.name) {
        return {
          statusCode: 400,
          message: 'Student does not have a residence assigned.',
          data: null,
        };
      }

      const residenceNameFromStudent = candidateStudent.residence.name
        .replace(/['-]/g, '') // optionally remove dashes/apostrophes
        .trim()
        .toLowerCase();

      if (residenceNameFromPosition !== residenceNameFromStudent) {
        return {
          statusCode: 400,
          message: `Position is for "${residenceNameFromPosition}" residence, but student belongs to "${residenceNameFromStudent}" residence.`,
          data: null,
        };
      }
    }

    const candidate = this.candidateRepo.create(Object.assign(new CandidateApplication(), {
      student: candidateStudent,
      full_name: `${candidateStudent.first_name} ${candidateStudent.last_name}`,
      email: candidateStudent.email,
      school: candidateStudent.school,
      department: candidateStudent.department,
      major: candidateStudent.program,
      tribe: candidateStudent.tribe,
      gender: candidateStudent.gender,
      gpa: candidateStudent.gpa,
      year_of_study: candidateStudent.year_of_study,
      nationality: candidateStudent.nationality,
      credit_hours: candidateStudent.credit_hours,
      has_disciplinary_issue: candidateStudent.hasDisciplinaryIssues,
      status: 'pending',
      residence: candidateStudent.residence,
      position,
      election,
      vice_president: isPresidentPosition ? vicePresidentData : undefined,
    }));

    await this.candidateRepo.save(candidate);

    return {
      statusCode: 201,
      message: 'Candidate application submitted',
      data: {
        id: candidate.id,
        full_name: candidate.full_name,
        student_id: candidate.student.student_id,
        email: candidate.email,
        school: candidate.school,
        department: candidate.department,
        tribe: candidate.tribe,
        gender: candidate.gender,
        gpa: candidate.gpa,
        year_of_study: candidate.year_of_study,
        major: candidate.program,
        nationality: candidate.nationality,
        credit_hours: candidate.credit_hours,
        has_disciplinary_issue: candidate.has_disciplinary_issue,
        status: candidate.status,
        residence: candidate.residence,
        position_name: position?.name || null,
        election_id: election?.id || null,
        created_at: candidate.created_at,
        vice_president_details: vicePresidentData
          ? {
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
          }
          : null,
      },
    };
  }

  async getAllCandidates(): Promise<HttpResponseInterface<any>> {
    const candidates = await this.candidateRepo.find();
    return { statusCode: 200, message: 'All candidates fetched', data: candidates };
  }

  async getCandidateById(id: number): Promise<HttpResponseInterface<any>> {
    const candidate = await this.candidateRepo.findOne({ where: { id } });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return { statusCode: 200, message: 'Candidate found', data: candidate };
  }

  async getAllDelegates(): Promise<HttpResponseInterface<any>> {
    const delegates = await this.delegateRepo.find();
    return { statusCode: 200, message: 'All delegates fetched', data: delegates };
  }

  async getDelegateById(id: number): Promise<HttpResponseInterface<any>> {
    const delegate = await this.delegateRepo.findOne({ where: { id } });
    if (!delegate) throw new NotFoundException('Delegate not found');
    return { statusCode: 200, message: 'Delegate found', data: delegate };
  }

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

  async deleteCandidate(id: number): Promise<HttpResponseInterface<any>> {
    const candidate = await this.candidateRepo.findOne({ where: { id } });
    if (!candidate) throw new NotFoundException('Candidate not found');

    await this.candidateRepo.remove(candidate);
    return { statusCode: 200, message: 'Candidate deleted', data: null };
  }

  async deleteDelegate(id: number): Promise<HttpResponseInterface<any>> {
    const delegate = await this.delegateRepo.findOne({ where: { id } });
    if (!delegate) throw new NotFoundException('Delegate not found');

    await this.delegateRepo.remove(delegate);
    return { statusCode: 200, message: 'Delegate deleted', data: null };
  }
}
