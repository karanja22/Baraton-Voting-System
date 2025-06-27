import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';
import { Repository } from 'typeorm';
import { CreateElectionDto } from './dtos/create-election.dto';
import { UpdateElectionDto } from './dtos/update-election.dto';
import { Election } from './entities/election.entity';
import { Position } from 'src/shared/entities/position.entity';

@Injectable()
export class ElectionsService {
  constructor(
    @InjectRepository(Election)
    private readonly electionRepo: Repository<Election>,

    @InjectRepository(Position)
    private readonly positionRepo: Repository<Position>,
  ) { }

  /**
   * Create a new election. If has_positions is true, positions[] must be provided.
   */
  async createElection(
    dto: CreateElectionDto,
  ): Promise<HttpResponseInterface<Election>> {
    // ensure dates are valid
    if (new Date(dto.start_date) >= new Date(dto.end_date)) {
      throw new BadRequestException('start_date must be before end_date');
    }

    // create base election
    const election = this.electionRepo.create({
      title: dto.title,
      type: dto.type,
      start_date: new Date(dto.start_date),
      end_date: new Date(dto.end_date),
      has_positions: dto.has_positions !== false,
    });
    await this.electionRepo.save(election);

    // if positions mode, validate and save positions
    if (election.has_positions) {
      if (!dto.positions || dto.positions.length === 0) {
        throw new BadRequestException(
          'Positions array is required for position-based elections.',
        );
      }
      const posEntities = dto.positions.map((posDto) =>
        this.positionRepo.create({
          name: posDto.name,
          isVicePosition: posDto.isVicePosition || false,
          election,
        }),
      );
      await this.positionRepo.save(posEntities);
    }

    return {
      statusCode: 201,
      message: 'Election created successfully',
      data: election,
    };
  }

  /**
   * List all elections, including positions if any
   */
  async findAll(): Promise<HttpResponseInterface<any[]>> {
    const elections = await this.electionRepo.find({ relations: ['positions'] });

    const enriched = elections.map((election) => ({
      ...election,
      status: election.getStatus(),
    }));

    return {
      statusCode: 200,
      message: 'All elections fetched',
      data: enriched,
    };
  }

  /**
   * Fetch a single election by id
   */
  async findOne(id: number): Promise<HttpResponseInterface<any>> {
    const election = await this.electionRepo.findOne({
      where: { id },
      relations: ['positions'],
    });

    if (!election) throw new NotFoundException('Election not found');

    return {
      statusCode: 200,
      message: 'Election fetched successfully',
      data: {
        ...election,
        status: election.getStatus(),
      },
    };
  }

  /**
   * Update an election's metadata (title, dates, mode, positions optional)
   */
  async updateElection(
    id: number,
    dto: UpdateElectionDto,
  ): Promise<HttpResponseInterface<Election>> {
    const election = await this.electionRepo.findOne({
      where: { id },
      relations: ['positions'],
    });
    if (!election) throw new NotFoundException('Election not found');

    // If switching to position-mode, ensure positions array
    if (dto.has_positions === true && dto.positions?.length === 0) {
      throw new BadRequestException(
        'Cannot enable positions mode without providing positions.',
      );
    }

    // merge primitive fields
    const merged = this.electionRepo.merge(election, {
      title: dto.title,
      type: dto.type,
      start_date: dto.start_date ? new Date(dto.start_date) : undefined,
      end_date: dto.end_date ? new Date(dto.end_date) : undefined,
      has_positions: dto.has_positions,
    });
    await this.electionRepo.save(merged);

    // if positions provided, replace existing
    if (dto.positions) {
      // delete old
      await this.positionRepo.delete({ election: { id } as any });
      // insert new
      const newPos = dto.positions.map((p) =>
        this.positionRepo.create({
          name: p.name,
          isVicePosition: p.isVicePosition || false,
          election: merged,
        }),
      );
      await this.positionRepo.save(newPos);
      merged.positions = newPos;
    }

    return {
      statusCode: 200,
      message: 'Election updated successfully',
      data: merged,
    };
  }

  /**
   * Delete an election (and cascade to positions)
   */
  async deleteElection(
    id: number,
  ): Promise<HttpResponseInterface<null>> {
    const result = await this.electionRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Election not found');
    return {
      statusCode: 200,
      message: 'Election deleted successfully',
      data: null,
    };
  }
}
