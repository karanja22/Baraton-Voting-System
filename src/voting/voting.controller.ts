import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { VotingService } from './voting.service';
import { CreateVoteDto } from './dtos/create-vote.dto';
import { Vote } from './entities/voing.entity';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';

@Controller('voting')
export class VotingController {
  constructor(private readonly votingService: VotingService) { }

  @Post()
  async cast(
    @Body() dto: CreateVoteDto,
  ): Promise<HttpResponseInterface<Vote>> {
    return this.votingService.castVote(dto);
  }

  /** 2. Check if a voter has already voted for a given position/election */
  @Get('has-voted')
  async hasVoted(
    @Query('voter_id', ParseIntPipe) voter_id: number,
    @Query('position_id', ParseIntPipe) position_id: number,
    @Query('election_id', ParseIntPipe) election_id: number,
  ): Promise<HttpResponseInterface<{ hasVoted: boolean }>> {
    return this.votingService.hasVoted(voter_id, position_id, election_id);
  }

  /** 3. List all votes */
  @Get()
  async findAll(): Promise<HttpResponseInterface<Vote[]>> {
    return this.votingService.findAll();
  }

  /** 4. Get a single vote by its ID */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponseInterface<Vote>> {
    return this.votingService.findOne(id);
  }

  /** 5. Tally results for one position in one election */
  @Get('results/:electionId/:positionId')
  async getResults(
    @Param('electionId', ParseIntPipe) electionId: number,
    @Param('positionId', ParseIntPipe) positionId: number,
  ): Promise<
    HttpResponseInterface<
      Array<{
        candidateId: number;
        full_name: string;
        voteCount: number;
      }>
    >
  > {
    return this.votingService.getResults(electionId, positionId);
  }
}
