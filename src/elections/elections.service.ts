import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';
import { Repository } from 'typeorm';
import { CreateElectionDto } from './dtos/create-election.dto';
import { Election } from './entities/election.entity';
import { UpdateElectionDto } from './dtos/update-election.dto';
import { Position } from 'src/shared/entities/position.entity';

@Injectable()
export class ElectionsService {
  constructor(
    @InjectRepository(Election)
    private readonly electionRepo: Repository<Election>,

    @InjectRepository(Position)
    private readonly positionRepo: Repository<Position>,
  ) { }

  async createElection(dto: CreateElectionDto): Promise<HttpResponseInterface<Election>> {
    // 1. Create and save the election
    const election = this.electionRepo.create({
      title: dto.title,
      start_date: dto.start_date,
      end_date: dto.end_date,
    });
    await this.electionRepo.save(election);

    // 2. Handle associated positions (if provided)
    if (dto.positions?.length) {
      const positions = dto.positions.map((pos) =>
        this.positionRepo.create({
          name: pos.name,
          isVicePosition: pos.isVicePosition || false,
          election,
        })
      );
      await this.positionRepo.save(positions);
    }

    return {
      statusCode: 201,
      message: 'Election created successfully',
      data: election,
    };
  }

  async findAll(): Promise<HttpResponseInterface<Election[]>> {
    const elections = await this.electionRepo.find({
      relations: ['positions'],
    });
    return {
      statusCode: 200,
      message: 'All elections fetched',
      data: elections,
    };
  }

  async findOne(id: number): Promise<HttpResponseInterface<Election>> {
  const election = await this.electionRepo.findOne({
    where: { id },
    relations: ['positions'],
  });

  if (!election) {
    throw new NotFoundException('Election not found');
  }

  return {
    statusCode: 200,
    message: 'Election fetched successfully',
    data: election,
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
