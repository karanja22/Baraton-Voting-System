import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { VotingService } from './voting.service';
import { CreateVoteDto } from './dtos/create-vote.dto';
import { Vote } from './entities/voing.entity';
import { HttpResponseInterface } from 'src/shared/interfaces/http-response.interface';
import { ElectionResultsInterface } from './interfaces/results.interface';
import { CreateDelegateVoteDto } from './dtos/create-delegate-vote.dto';
import { DelegateVote } from './entities/delegate-voting.entity';

@Controller('voting')
export class VotingController {
  constructor(private readonly votingService: VotingService) { }

  @Post('candidate')
  async cast(
    @Body() dto: CreateVoteDto,
  ): Promise<HttpResponseInterface<Vote>> {
    return this.votingService.castVote(dto);
  }
  @Post('delegate')
  async castDelegateVote(
    @Body() dto: CreateDelegateVoteDto,
  ): Promise<HttpResponseInterface<DelegateVote>> {
    return this.votingService.castDelegateVote(dto);
  }


  @Get('has-voted')
  async hasVoted(
    @Query('voter_id', ParseIntPipe) voter_id: number,
    @Query('position_id', ParseIntPipe) position_id: number,
    @Query('election_id', ParseIntPipe) election_id: number,
  ): Promise<HttpResponseInterface<{ hasVoted: boolean }>> {
    return this.votingService.hasVoted(voter_id, position_id, election_id);
  }

  @Get()
  async findAll(): Promise<HttpResponseInterface<Vote[]>> {
    return this.votingService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HttpResponseInterface<Vote>> {
    return this.votingService.findOne(id);
  }

  @Get('candidate-results/:electionId/:positionId')
  async getResults(
    @Param('electionId', ParseIntPipe) electionId: number,
    @Param('positionId', ParseIntPipe) positionId: number,
  ): Promise<HttpResponseInterface<ElectionResultsInterface>> {
    return this.votingService.getResults(electionId, positionId);
  }

  @Get('delegate-results/:electionId')
  async getDelegateResults(
    @Param('electionId', ParseIntPipe) electionId: number,
  ): Promise<
    HttpResponseInterface<
      Array<{
        delegateId: number;
        full_name: string;
        voteCount: number;
      }>
    >
  > {
    return this.votingService.getDelegateResults(electionId);
  }

}
