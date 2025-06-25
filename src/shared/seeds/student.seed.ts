// src/seed/seed-students.ts

import { DataSource } from 'typeorm';
import { Student } from 'src/users/entities/student.entity';
import { sampleStudents } from 'src/seed/student.data';

export const seedStudents = async (dataSource: DataSource) => {
    const studentRepo = dataSource.getRepository(Student);

    let newCount = 0;

    for (const sample of sampleStudents) {
        const existing = await studentRepo.findOne({
            where: { student_id: sample.student_id },
        });

        if (!existing) {
            const student = studentRepo.create(sample);
            await studentRepo.save(student);
            newCount++;
        }
    }

    if (newCount > 0) {
        console.log(`Seeded ${newCount} new students.`);
    } else {
        console.log('No new students added. All student IDs already exist.');
    }
};
