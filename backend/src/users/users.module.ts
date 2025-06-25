import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Department } from 'src/shared/entities/department.entity';
import { Program } from 'src/shared/entities/program.entity';
import { Residence } from 'src/shared/entities/residence.entity';
import { School } from 'src/shared/entities/school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Department, Program, School, Residence])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
