// src/seed/seed.ts

import { DataSource } from 'typeorm';
import { Student } from '../users/entities/student.entity';
import { sampleStudents } from './student.data';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Student],
    synchronize: true,
});

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('📦 DataSource initialized.');

        const studentRepo = AppDataSource.getRepository(Student);

        const existing = await studentRepo.find();
        if (existing.length) {
            console.log('Students already exist. Skipping seed.');
            return;
        }

        const students = studentRepo.create(sampleStudents);
        await studentRepo.save(students);

        console.log(`Seeded ${students.length} students.`);
    } catch (error) {
        console.error('Seed failed:', error);
    } finally {
        await AppDataSource.destroy();
        console.log('Connection closed.');
    }
}

seed();
