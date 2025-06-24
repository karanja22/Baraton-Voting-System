// src/votes/votes.service.ts
import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from 'src/users/entities/student.entity';
import { CandidateApplication } from 'src/application/entities/candidate-application.entity';
import { Position } from 'src/shared/entities/position.entity';
import { Election } from 'src/elections/entities/election.entity';
import { CreateVoteDto } from './dtos/create-vote.dto';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';
import { Vote } from './entities/voing.entity';

@Injectable()
export class VotingService {
    constructor(
        @InjectRepository(Vote) private voteRepo: Repository<Vote>,
        @InjectRepository(Student) private studentRepo: Repository<Student>,
        @InjectRepository(CandidateApplication)
        private candRepo: Repository<CandidateApplication>,
        @InjectRepository(Position) private posRepo: Repository<Position>,
        @InjectRepository(Election) private electRepo: Repository<Election>,
    ) { }

    /** 1. Cast a vote */
    async castVote(dto: CreateVoteDto): Promise<HttpResponseInterface<Vote>> {
        const voter = await this.studentRepo.findOne({
            where: { student_id: dto.voter_id },
        });
        if (!voter) throw new NotFoundException('Voter not found');

        const candidate = await this.candRepo.findOne({
            where: { id: dto.candidate_id },
            relations: ['position', 'position.election'],
        });
        if (!candidate) throw new NotFoundException('Candidate not found');

        const position = candidate.position;
        const election = position.election;

        if (position.id !== dto.position_id || election.id !== dto.election_id) {
            throw new BadRequestException(
                'Candidate does not belong to the specified position or election',
            );
        }

        const existingVote = await this.voteRepo.findOne({
            where: {
                voter: { student_id: dto.voter_id },
                position: { id: dto.position_id },
                election: { id: dto.election_id },
            },
            relations: ['voter', 'position', 'election'],
        });

        if (existingVote) {
            throw new BadRequestException(
                'You have already voted for this position in this election',
            );
        }

        const vote = this.voteRepo.create({
            voter,
            candidate,
            position,
            election,
        });
        await this.voteRepo.save(vote);

        return {
            statusCode: 201,
            message: 'Vote cast successfully',
            data: vote,
        };
    }

    /** 2. Check if voter has already voted */
    async hasVoted(
        voter_id: number,
        position_id: number,
        election_id: number,
    ): Promise<HttpResponseInterface<{ hasVoted: boolean }>> {
        const voter = await this.studentRepo.findOne({
            where: { student_id: voter_id },
        });
        if (!voter) throw new NotFoundException('Voter not found');

        const position = await this.posRepo.findOne({ where: { id: position_id } });
        if (!position) throw new NotFoundException('Position not found');

        const election = await this.electRepo.findOne({ where: { id: election_id } });
        if (!election) throw new NotFoundException('Election not found');

        const existing = await this.voteRepo.findOne({
            where: {
                voter: { student_id: voter_id },
                position: { id: position_id },
                election: { id: election_id },
            },
        });

        return {
            statusCode: 200,
            message: 'Vote status retrieved',
            data: { hasVoted: !!existing },
        };
    }

    /** 3. Get all votes */
    async findAll(): Promise<HttpResponseInterface<Vote[]>> {
        const votes = await this.voteRepo.find({
            relations: ['voter', 'candidate', 'position', 'election'],
        });
        return {
            statusCode: 200,
            message: 'All votes fetched',
            data: votes,
        };
    }

    /** 4. Get vote by ID */
    async findOne(id: number): Promise<HttpResponseInterface<Vote>> {
        const vote = await this.voteRepo.findOne({
            where: { id },
            relations: ['voter', 'candidate', 'position', 'election'],
        });
        if (!vote) throw new NotFoundException('Vote not found');
        return {
            statusCode: 200,
            message: 'Vote found',
            data: vote,
        };
    }

    /** 5. Get results for a given election & position */
    async getResults(
        electionId: number,
        positionId: number,
    ): Promise<
        HttpResponseInterface<
            Array<{ candidateId: number; full_name: string; voteCount: number }>
        >
    > {
        const raw = await this.voteRepo
            .createQueryBuilder('vote')
            .select('candidate.id', 'candidateId')
            .addSelect('candidate.full_name', 'full_name')
            .addSelect('COUNT(*)', 'voteCount')
            .innerJoin('vote.candidate', 'candidate')
            .where('vote.election = :electionId', { electionId })
            .andWhere('vote.position = :positionId', { positionId })
            .groupBy('candidate.id')
            .addGroupBy('candidate.full_name')
            .orderBy('voteCount', 'DESC')
            .getRawMany();

        return {
            statusCode: 200,
            message: `Results for election ${electionId}, position ${positionId}`,
            data: raw.map((r) => ({
                candidateId: Number(r.candidateId),
                full_name: r.full_name,
                voteCount: Number(r.voteCount),
            })),
        };
    }
}
