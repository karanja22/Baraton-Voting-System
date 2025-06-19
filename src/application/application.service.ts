import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDelegateDto } from './dto/create-delegate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';
import { Student } from 'src/users/entities/student.entity';
import { Repository } from 'typeorm';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CandidateApplication } from './entities/candidate-application.entity';
import { DelegateApplication } from './entities/delegate-application.entity';

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
        const student = await this.studentRepo.findOne({ where: { student_id: dto.student_id } });

        if (!student) {
            return { statusCode: 400, message: 'Student not found', data: null };
        }

        const mismatch = dto.email !== student.email || dto.school !== student.school_name;
        if (mismatch) {
            return { statusCode: 400, message: 'Provided data does not match student records', data: null };
        }

        const delegate = this.delegateRepo.create({
            ...dto,
            full_name: `${student.first_name} ${student.last_name}`,
            department: student.department_name,
            tribe: student.tribe,
            gender: student.gender,
            gpa: student.gpa,
            year_of_study: student.year_of_study,
            major: student.program_name,
            has_disciplinary_issue: false,
            credit_hours: student.credit_hours,
            status: 'pending',
        });

        await this.delegateRepo.save(delegate);
        return { statusCode: 201, message: 'Delegate application submitted', data: delegate };
    }

    async submitCandidateApplication(dto: CreateCandidateDto): Promise<HttpResponseInterface<any>> {
        const student = await this.studentRepo.findOne({ where: { student_id: dto.student_id } });

        if (!student) {
            return { statusCode: 400, message: 'Student not found', data: null };
        }

        const candidate = this.candidateRepo.create({
            ...dto,
            full_name: `${student.first_name} ${student.last_name}`,
            email: student.email,
            school: student.school_name,
            department: student.department_name,
            tribe: student.tribe,
            gender: student.gender,
            gpa: student.gpa,
            year_of_study: student.year_of_study,
            major: student.program_name,
            nationality: student.nationality,
            credit_hours: student.credit_hours,
            has_disciplinary_issue: false,
            status: 'pending',
        });

        await this.candidateRepo.save(candidate);
        return { statusCode: 201, message: 'Candidate application submitted', data: candidate };
    }

    async reviewCandidate(id: number): Promise<HttpResponseInterface<any>> {
        const candidate = await this.candidateRepo.findOne({ where: { id } });
        if (!candidate) throw new NotFoundException('Candidate application not found');

        const {
            gpa,
            credit_hours,
            position,
            residence,
            school,
            department,
            nationality,
            major,
            has_disciplinary_issue,
        } = candidate;

        let approved = true;

        if (has_disciplinary_issue) approved = false;
        if (gpa < 2.5 || credit_hours < 54 || credit_hours > 100) approved = false;

        const religiousPosts = ['President', 'Vice President', 'Secretary General', 'Senator Religious Affairs'];
        const specializedPosts = [
            'Finance Secretary',
            'Planning and Labour Secretary',
            'Academics and Foreign Affairs Secretary',
            'Sports and Entertainment Secretary',
            'Gender and Special Interest Secretary'
        ];

        if (position === 'President' || position === 'Vice President') {
            if (credit_hours < 60) approved = false;
        }

        if (position === 'Senator of Residence') {
            approved &&= ['Men\'s Dorm', 'Ladies Dorm', 'Off Campus Men', 'Off Campus Female'].includes(residence);
        } else if (position === 'Senator of School') {
            approved &&= Boolean(school);
        } else if (position === 'Senator Religious Affairs') {
            approved &&= department === 'Theology';
        } else if (position === 'Senator International Rep') {
            approved &&= nationality.toLowerCase() !== 'kenyan';
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

        const approved = delegate.gpa >= 2.5 && delegate.credit_hours >= 54 && !delegate.has_disciplinary_issue && delegate.status === 'pending';
        delegate.status = approved ? 'approved' : 'rejected';
        await this.delegateRepo.save(delegate);

        return {
            statusCode: 200,
            message: `Delegate application ${delegate.status}`,
            data: delegate,
        };
    }
}
