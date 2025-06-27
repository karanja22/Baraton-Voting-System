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
import { Vote } from './entities/voting.entity';
import { ElectionResultsInterface } from './interfaces/results.interface';
import { CreateDelegateVoteDto } from './dtos/create-delegate-vote.dto';
import { DelegateVote } from './entities/delegate-voting.entity';
import { DelegateApplication } from 'src/application/entities/delegate-application.entity';

@Injectable()
export class VotingService {
    constructor(
        @InjectRepository(Vote) private voteRepo: Repository<Vote>,
        @InjectRepository(Student) private studentRepo: Repository<Student>,
        @InjectRepository(CandidateApplication)
        private candRepo: Repository<CandidateApplication>,
        @InjectRepository(Position) private posRepo: Repository<Position>,
        @InjectRepository(Election) private electRepo: Repository<Election>,
        @InjectRepository(DelegateVote)
        private readonly delegateVoteRepo: Repository<DelegateVote>,
        @InjectRepository(DelegateApplication)
        private readonly delegateRepo: Repository<DelegateApplication>

    ) { }

    /** Vote for candidate */
    async castVote(dto: CreateVoteDto): Promise<HttpResponseInterface<Vote>> {
        const voter = await this.studentRepo.findOne({
            where: { student_id: dto.voter_id },
        });
        if (!voter) throw new NotFoundException('Voter not found');

        const candidate = await this.candRepo.findOne({
            where: { id: dto.candidate_id },
            relations: ['position', 'position.election', 'election'],
        });

        // Restrict SEC election to appointed delegates only
        if (dto.election_id === 2) {
            const delegate = await this.delegateRepo.findOne({
                where: {
                    student: { student_id: dto.voter_id },
                    status: 'approved',
                    isSelected: true,
                },
                relations: ['student'],
            });

            if (!delegate) {
                throw new BadRequestException('Only appointed delegates can vote in the SEC election');
            }
        }

        if (!candidate) throw new NotFoundException('Candidate not found');

        const candidateElection = candidate.election;
        const candidatePosition = candidate.position;

        if (!candidateElection)
            throw new BadRequestException('Candidate is not tied to any election');

        if (candidate.status !== 'approved') {
            return {
                statusCode: 400,
                message: 'Candidate is not approved and cannot be voted for',
                data: null,
            };
        }

        // check if electionId matches
        if (dto.election_id !== candidateElection.id) {
            throw new BadRequestException(
                'Candidate does not belong to the specified election',
            );
        }

        const election = await this.electRepo.findOne({
            where: { id: dto.election_id },
            relations: ['positions'],
        });

        // Load full student data for eligibility checks
        const fullVoter = await this.studentRepo.findOne({
            where: { student_id: dto.voter_id },
            relations: ['school', 'department', 'residence'],
        });

        if (!fullVoter) {
            throw new NotFoundException('Voter details not found');
        }

        const fullCandidate = await this.studentRepo.findOne({
            where: { student_id: candidate.student.student_id },
            relations: ['school', 'department', 'residence'],
        });

        if (!fullCandidate) {
            throw new NotFoundException('Candidate details not found');
        }

        const positionName = candidatePosition?.name?.toLowerCase() || '';

        if (positionName.includes('senator school')) {
            if (fullVoter.school?.id !== fullCandidate.school?.id) {
                throw new BadRequestException('You can only vote for a candidate from your school');
            }
        } else if (positionName.includes('senator residence')) {
            if (fullVoter.residence?.id !== fullCandidate.residence?.id) {
                throw new BadRequestException('You can only vote for a candidate from your residence');
            }
        } else if (positionName.includes('senator international rep')) {
            if (fullVoter.nationality?.toLowerCase() === 'kenyan') {
                throw new BadRequestException('Only international students can vote for international rep');
            }
        }

        if (!election) throw new NotFoundException('Election not found');

        const isStructured = election.positions?.length > 0;

        // Check vote context based on structured/unstructured
        if (isStructured) {
            if (!dto.position_id) {
                throw new BadRequestException('Position is required for this election');
            }

            if (!candidatePosition || candidatePosition.id !== dto.position_id) {
                throw new BadRequestException(
                    'Candidate does not match the given position in this election',
                );
            }

            // check if this voter already voted for this position
            const existingVote = await this.voteRepo.findOne({
                where: {
                    voter: { student_id: dto.voter_id },
                    election: { id: dto.election_id },
                    position: { id: dto.position_id },
                },
                relations: ['voter', 'election', 'position'],
            });

            if (existingVote)
                throw new BadRequestException('You have already voted for this position');
        } else {
            // unstructured: vote only based on election
            if (dto.position_id) {
                throw new BadRequestException(
                    'Position must not be provided for elections without positions',
                );
            }

            const existingVote = await this.voteRepo.findOne({
                where: {
                    voter: { student_id: dto.voter_id },
                    election: { id: dto.election_id },
                },
                relations: ['voter', 'election'],
            });

            if (existingVote)
                throw new BadRequestException('You have already voted in this election');
        }

        const vote = this.voteRepo.create({
            voter,
            candidate,
            election,
            position: isStructured ? candidatePosition : undefined,
        });

        await this.voteRepo.save(vote);

        return {
            statusCode: 201,
            message: 'Vote cast successfully',
            data: {
                id: vote.id,
                casted_at: vote.casted_at,
                voter: {
                    student_id: vote.voter.student_id,
                    full_name: `${vote.voter.first_name} ${vote.voter.last_name}`,
                },
                candidate: {
                    id: vote.candidate.id,
                    full_name: vote.candidate.full_name,
                    student_id: vote.candidate.student?.student_id,
                },
                position: {
                    id: vote.position.id,
                    name: vote.position.name,
                    election: vote.position.election,
                },
                election: {
                    id: vote.election.id,
                    title: vote.election.title,
                },
            } as any,
        };
    }

    async castDelegateVote(dto: CreateDelegateVoteDto): Promise<HttpResponseInterface<any>> {
        const voter = await this.studentRepo.findOne({ where: { student_id: dto.voter_id } });
        if (!voter) throw new NotFoundException('Voter not found');

        const delegate = await this.delegateRepo.findOne({
            where: { id: dto.delegate_id },
            relations: ['student'],
        });
        if (!delegate) throw new NotFoundException('Delegate not found');
        if (delegate.status !== 'approved') {
            throw new BadRequestException('Delegate is not approved for voting');
        }

        if (voter.department?.id !== delegate.student?.department?.id) {
            throw new BadRequestException('You can only vote for a delegate from your department');
        }
        const election = await this.electRepo.findOne({
            where: { id: dto.election_id },
            relations: ['positions'],
        });
        if (!election) throw new NotFoundException('Election not found');

        const isUnstructured = !election.positions || election.positions.length === 0;
        if (!isUnstructured) {
            throw new BadRequestException('This election uses structured voting, not for delegates');
        }

        const existingVote = await this.delegateVoteRepo.findOne({
            where: {
                voter: { student_id: dto.voter_id },
                election: { id: dto.election_id },
            },
        });

        if (existingVote) {
            throw new BadRequestException('You have already voted in this delegate election');
        }

        const vote = this.delegateVoteRepo.create({ voter, delegate, election });
        await this.delegateVoteRepo.save(vote);

        return {
            statusCode: 201,
            message: 'Vote for delegate cast successfully',
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
    ): Promise<HttpResponseInterface<ElectionResultsInterface>> {
        const election = await this.electRepo.findOne({ where: { id: electionId } });
        const position = await this.posRepo.findOne({ where: { id: positionId } });

        if (!election || !position) {
            return {
                statusCode: 404,
                message: 'Election or Position not found',
                data: null,
            };
        }

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
            .orderBy('"voteCount"', 'DESC')
            .getRawMany();

        const results: ElectionResultsInterface = {
            election: election.title,
            position: position.name,
            results: raw.map((r) => ({
                candidateId: Number(r.candidateId),
                full_name: r.full_name,
                voteCount: Number(r.voteCount),
            })),
        };

        return {
            statusCode: 200,
            message: `Results for ${position.name} in ${election.title}`,
            data: results,
        };
    }

    async getDelegateResults(electionId: number): Promise<HttpResponseInterface<any>> {
        const election = await this.electRepo.findOne({ where: { id: electionId } });

        if (!election) {
            return {
                statusCode: 404,
                message: 'Election not found',
                data: null,
            };
        }

        const results = await this.delegateVoteRepo
            .createQueryBuilder('vote')
            .select('delegate.id', 'delegateId')
            .addSelect('delegate.full_name', 'full_name')
            .addSelect('COUNT(*)', 'voteCount')
            .innerJoin('vote.delegate', 'delegate')
            .where('vote.electionId = :electionId', { electionId })
            .groupBy('delegate.id')
            .addGroupBy('delegate.full_name')
            .orderBy('COUNT(*)', 'DESC')
            .getRawMany();

        return {
            statusCode: 200,
            message: `Results for ${election.title}`,
            data: results.map(r => ({
                delegateId: Number(r.delegateId),
                full_name: r.full_name,
                voteCount: Number(r.voteCount),
            })),
        };
    }

}