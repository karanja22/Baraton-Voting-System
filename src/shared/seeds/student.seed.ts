// src/seed/seed-students.ts

import { DataSource } from 'typeorm';
import { Student } from 'src/users/entities/student.entity';
import { sampleStudents } from 'src/seed/student.data';

export const seedStudents = async (dataSource: DataSource) => {
    const studentRepo = dataSource.getRepository(Student);

    const existing = await studentRepo.find();
    if (existing.length) {
        console.log('⚠️  Students already exist. Skipping student seed.');
        return;
    }

    const students = studentRepo.create(sampleStudents);
    await studentRepo.save(students);

    console.log(`✅ Seeded ${students.length} students.`);
};
