import { Module } from '@nestjs/common';
import { VotingService } from './voting.service';
import { VotingController } from './voting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateApplication } from 'src/application/entities/candidate-application.entity';
import { Election } from 'src/elections/entities/election.entity';
import { Position } from 'src/shared/entities/position.entity';
import { Student } from 'src/users/entities/student.entity';
import { Vote } from './entities/voing.entity';
import { DelegateVote } from './entities/delegate-voting.entity';
import { DelegateApplication } from 'src/application/entities/delegate-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vote,
      Student,
      CandidateApplication,
      DelegateApplication,
      Position,
      Election,
      DelegateVote
    ]),
  ],
  controllers: [VotingController],
  providers: [VotingService],
})
export class VotingModule { }
