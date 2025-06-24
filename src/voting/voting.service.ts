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
                'Candidate does not belong to that position/election',
            );
        }

        const existing = await this.voteRepo.findOne({
            where: {
                voter: { student_id: dto.voter_id },
                position: { id: dto.position_id },
                election: { id: dto.election_id },
            },
            relations: ['voter', 'position', 'election'],
        });
        if (existing)
            throw new BadRequestException('You have already voted for this position');

        const vote = this.voteRepo.create({ voter, candidate, position, election });
        await this.voteRepo.save(vote);

        return {
            statusCode: 201,
            message: 'Vote cast successfully',
            data: vote,
        };
    }

    /** 2. Has this voter already voted for that position/election? */
    async hasVoted(
        voter_id: number,
        position_id: number,
        election_id: number,
    ): Promise<HttpResponseInterface<{ hasVoted: boolean }>> {
        const voter = await this.studentRepo.findOne({
            where: { student_id: voter_id },
        });
        const position = await this.posRepo.findOne({ where: { id: position_id } });
        const election = await this.electRepo.findOne({ where: { id: election_id } });
        if (!voter || !position || !election)
            throw new BadRequestException('Invalid parameters');

        const existing = await this.voteRepo.findOne({
            where: { voter, position, election },
        });
        return { statusCode: 200, message: 'Check complete', data: { hasVoted: !!existing } };
    }

    /** 3. List all votes (for admin/debug) */
    async findAll(): Promise<HttpResponseInterface<Vote[]>> {
        const votes = await this.voteRepo.find();
        return { statusCode: 200, message: 'All votes fetched', data: votes };
    }

    /** 4. Get one vote by ID */
    async findOne(id: number): Promise<HttpResponseInterface<Vote>> {
        const vote = await this.voteRepo.findOne({ where: { id } });
        if (!vote) throw new NotFoundException('Vote not found');
        return { statusCode: 200, message: 'Vote found', data: vote };
    }

    /** 5. Get tally for a given position in a given election */
    async getResults(
        electionId: number,
        positionId: number,
    ): Promise<HttpResponseInterface<Array<{
        candidateId: number;
        full_name: string;
        voteCount: number;
    }>>> {
        const raw = await this.voteRepo
            .createQueryBuilder('vote')
            .select('vote.candidateId', 'candidateId')
            .addSelect('candidate.full_name', 'full_name')
            .addSelect('COUNT(*)', 'voteCount')
            .innerJoin('vote.candidate', 'candidate')
            .where('vote.election = :electionId', { electionId })
            .andWhere('vote.position = :positionId', { positionId })
            .groupBy('vote.candidateId')
            .addGroupBy('candidate.full_name')
            .orderBy('voteCount', 'DESC')
            .getRawMany();

        return {
            statusCode: 200,
            message: `Results for election ${electionId}, position ${positionId}`,
            data: raw.map(r => ({
                candidateId: Number(r.candidateId),
                full_name: r.full_name,
                voteCount: Number(r.voteCount),
            })),
        };
    }
}
