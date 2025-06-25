import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/users/entities/student.entity';
import { DelegateApplication } from './entities/delegate-application.entity';
import { CandidateApplication } from './entities/candidate-application.entity';
import { Position } from 'src/shared/entities/position.entity';
import { Election } from 'src/elections/entities/election.entity';
import { Residence } from 'src/shared/entities/residence.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      CandidateApplication,
      DelegateApplication,
      Position,
      Election,
      Residence,
    ]),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule { }
