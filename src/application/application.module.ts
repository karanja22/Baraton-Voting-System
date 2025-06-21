import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from 'src/users/entities/student.entity';
import { CandidateApplication } from './entities/candidate-application.entity';
import { DelegateApplication } from './entities/delegate-application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, CandidateApplication, DelegateApplication])],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule { }
