// src/seed/seed.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { School } from './shared/entities/school.entity';
import { Department } from 'src/shared/entities/department.entity';
import { Program } from 'src/shared/entities/program.entity';
import { Residence } from 'src/shared/entities/residence.entity';
import { Student } from 'src/users/entities/student.entity';
import { seedResidences } from './shared/seeds/residences';
import { seedAcademicHierarchy } from './shared/seeds/schools';
import { seedStudents } from './shared/seeds/student.seed';
import { seedElectionsAndPositions } from './shared/seeds/positions.seed';
import { Position } from './shared/entities/position.entity';
import { Election } from './elections/entities/election.entity';
import { CandidateApplication } from './application/entities/candidate-application.entity';

config();

const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
        Student,
        School,
        Department,
        Program,
        Residence,
        Election,
        CandidateApplication,
        Position,
    ],
    synchronize: true,
});

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('📡 DataSource initialized.');

        await seedAcademicHierarchy(AppDataSource);
        await seedResidences(AppDataSource);
        await seedElectionsAndPositions(AppDataSource);
        await seedStudents(AppDataSource);

        console.log('All seeds completed.');
    } catch (error) {
        console.error('Seed failed:', error);
    } finally {
        await AppDataSource.destroy();
        console.log('Connection closed.');
    }
}

seed();
