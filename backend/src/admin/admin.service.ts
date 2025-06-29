import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from 'src/shared/entities/position.entity';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';
import { CandidateApplication } from 'src/application/entities/candidate-application.entity';
import { DelegateApplication } from 'src/application/entities/delegate-application.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(CandidateApplication)
        private candidateRepo: Repository<CandidateApplication>,

        @InjectRepository(DelegateApplication)
        private delegateRepo: Repository<DelegateApplication>,

        @InjectRepository(Position)
        private positionRepo: Repository<Position>
    ) { }

    async reviewCandidate(id: number): Promise<HttpResponseInterface<any>> {
        const candidate = await this.candidateRepo.findOne({
            where: { id },
            relations: ['position', 'residence', 'school', 'department'],
        });

        if (!candidate) throw new NotFoundException('Candidate application not found');

        const {
            gpa,
            credit_hours,
            position,
            residence,
            school, department,
            nationality,
            has_disciplinary_issue,
        } = candidate;

        let approved = true;

        if (has_disciplinary_issue) approved = false;
        if (gpa < 2.5 || credit_hours < 54 || credit_hours > 100) approved = false;

        const positionName = position?.name?.toLowerCase();

        if (positionName === 'president' || position?.isVicePosition) {
            if (credit_hours < 60) approved = false;
        }

        if (positionName?.includes('senator residence')) {
            const validResidences = [
                "Men's Dorm",
                "Ladies' Dorm",
                'Off Campus Male',
                'Off Campus Female',
            ];
            approved &&= validResidences.includes(residence?.name || '');
        } else if (positionName?.includes('senator school of')) {
            approved &&= Boolean(school);
        } else if (positionName === 'senator religious affairs') {
            approved &&= department?.name?.toLowerCase().includes('theology');
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
