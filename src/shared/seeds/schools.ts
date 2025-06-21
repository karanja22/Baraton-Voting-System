// src/shared/seeds/hierarchy.seed.ts
import { DataSource } from 'typeorm';
import { School } from '../entities/school.entity';
import { Department } from '../entities/department.entity';
import { Program } from '../entities/program.entity';

export const seedAcademicHierarchy = async (dataSource: DataSource) => {
    const schoolRepo = dataSource.getRepository(School);
    const deptRepo = dataSource.getRepository(Department);
    const programRepo = dataSource.getRepository(Program);

    const hierarchy = [
        {
            name: 'School of Business',
            departments: [
                { name: 'Accounting', programs: ['BBA in Accounting', 'Diploma in Finance'] },
                { name: 'Management', programs: ['BBA in Management', 'MBA in Leadership'] },
            ],
        },
        {
            name: 'School of Education, Humanities and Social Sciences',
            departments: [
                { name: 'Education', programs: ['BEd in Arts', 'BEd in Sciences'] },
                { name: 'Humanities and Social Sciences', programs: ['BA in History', 'BA in Sociology'] },
                { name: 'Theology and Religious Studies', programs: ['BA in Theology', 'Diploma in Religious Education'] },
            ],
        },
        {
            name: 'School of Health Sciences',
            departments: [
                { name: 'Medical Laboratory Science', programs: ['BSc in Lab Technology', 'Diploma in Lab Diagnostics'] },
                { name: 'Public Health', programs: ['BSc in Public Health', 'Certificate in Epidemiology'] },
            ],
        },
        {
            name: 'School of Nursing',
            departments: [
                { name: 'Nursing', programs: ['BSc in Nursing', 'Diploma in Nursing Practice'] },
            ],
        },
        {
            name: 'School of Science and Technology',
            departments: [
                { name: 'Biological Sciences and Agriculture', programs: ['BSc in Biology', 'BSc in Agriculture'] },
                { name: 'Foods, Nutrition and Dietetics', programs: ['BSc in Human Nutrition', 'Diploma in Dietetics'] },
                { name: 'Information Systems and Computing', programs: ['BSc in Computer Science', 'BSc in Info Systems'] },
                { name: 'Mathematics, Chemistry and Physics', programs: ['BSc in Mathematics', 'BSc in Chemistry'] },
                { name: 'Technology and Applied Sciences', programs: ['BSc in Applied Tech', 'Diploma in Engineering'] },
            ],
        },
    ];

    for (const schoolData of hierarchy) {
        const school = schoolRepo.create({ name: schoolData.name });
        await schoolRepo.save(school);

        for (const deptData of schoolData.departments) {
            const department = deptRepo.create({
                name: deptData.name,
                school,
            });
            await deptRepo.save(department);

            for (const progName of deptData.programs) {
                const program = programRepo.create({
                    name: progName,
                    department,
                });
                await programRepo.save(program);
            }
        }
    }

    console.log('✅ Schools, Departments, and Programs seeded.');
};
