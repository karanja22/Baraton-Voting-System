import { Module } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { ElectionsController } from './elections.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Election } from './entities/election.entity';
import { Position } from 'src/shared/entities/position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Election, Position])],
  controllers: [ElectionsController],
  providers: [ElectionsService],
})
export class ElectionsModule { }
