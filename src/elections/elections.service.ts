import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';
import { Repository } from 'typeorm';
import { CreateElectionDto, UpdateElectionDto } from './dtos/create-election.dto';
import { UpdateElectionDto } from './dtos/update-election.dto';
import { Election } from './entities/election.entity';

@Injectable()
export class ElectionsService {
  constructor(
    @InjectRepository(Election)
    private readonly electionRepo: Repository<Election>,
  ) {}

  async createElection(dto: CreateElectionDto): Promise<HttpResponseInterface<Election>> {
    const election = this.electionRepo.create(dto);
    await this.electionRepo.save(election);
    return {
      statusCode: 201,
      message: 'Election created successfully',
      data: election,
    };
  }

  async findAll(): Promise<HttpResponseInterface<Election[]>> {
    const elections = await this.electionRepo.find();
    return {
      statusCode: 200,
      message: 'All elections fetched',
      data: elections,
    };
  }

  async updateElection(id: number, dto: UpdateElectionDto): Promise<HttpResponseInterface<Election>> {
    const election = await this.electionRepo.findOne({ where: { id } });
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const updated = this.electionRepo.merge(election, dto);
    await this.electionRepo.save(updated);

    return {
      statusCode: 200,
      message: 'Election updated successfully',
      data: updated,
    };
  }

  async deleteElection(id: number): Promise<HttpResponseInterface<null>> {
    const result = await this.electionRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Election not found');
    }

    return {
      statusCode: 200,
      message: 'Election deleted successfully',
      data: null,
    };
  }
}
