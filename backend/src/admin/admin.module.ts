import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateApplication } from 'src/application/entities/candidate-application.entity';
import { DelegateApplication } from 'src/application/entities/delegate-application.entity';
import { Position } from 'src/shared/entities/position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateApplication, DelegateApplication, Position])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }
