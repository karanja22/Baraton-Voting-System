// src/seed/student.data.ts

import { Residence } from '../shared/entities/residence.entity';
import { Student } from '../users/entities/student.entity';

export const sampleStudents: Partial<Student>[] = [
  {
    student_id: 1001,
    first_name: 'John',
    last_name: 'Omondi',
    email: 'john.omondi@ueab.ac.ke',
    phone_number: '+254701000001',
    gender: 'Male',
    tribe: 'Luo',
    region: 'Nyanza',
    date_of_birth: new Date('2002-04-12'),
    nationality: 'Kenyan',
    admission_year: 2021,
    year_of_study: 3,
    status: 'Active',
    isRegistered: true,
    isOnWorkProgram: false,
    gpa: 3.2,
    credit_hours: 65,
    school: { id: 5 } as any, // School of Science and Technology
    department: { id: 11 } as any, // Information Systems and Computing
    program: { id: 21 } as any, // BSc in Computer Science
    residence: { id: 1 } as Residence, // Men's Dorm
  },
  {
    student_id: 1002,
    first_name: 'Faith',
    last_name: 'Chebet',
    email: 'faith.chebet@ueab.ac.ke',
    phone_number: '+254701000002',
    gender: 'Female',
    tribe: 'Kalenjin',
    region: 'Rift Valley',
    date_of_birth: new Date('2001-09-23'),
    nationality: 'Kenyan',
    admission_year: 2020,
    year_of_study: 4,
    status: 'Active',
    isRegistered: true,
    isOnWorkProgram: true,
    gpa: 3.5,
    credit_hours: 85,
    school: { id: 1 } as any, // School of Business
    department: { id: 2 } as any, // Management
    program: { id: 3 } as any, // BBA in Management
    residence: { id: 2 } as Residence, // Ladies' Dorm
  },
  {
    student_id: 1003,
    first_name: 'Ali',
    last_name: 'Abdi',
    email: 'ali.abdi@ueab.ac.ke',
    phone_number: '+254701000003',
    gender: 'Male',
    tribe: 'Somali',
    region: 'North Eastern',
    date_of_birth: new Date('2003-01-15'),
    nationality: 'Kenyan',
    admission_year: 2022,
    year_of_study: 2,
    status: 'Active',
    isRegistered: false,
    isOnWorkProgram: false,
    gpa: 2.8,
    credit_hours: 48,
    school: { id: 3 } as any, // School of Health Sciences
    department: { id: 6 } as any, // Medical Laboratory Science
    program: { id: 11 } as any, // BSc in Lab Technology
    residence: { id: 3 } as Residence, // Off Campus Male
  },
  {
    student_id: 1004,
    first_name: 'Naomi',
    last_name: 'Kamau',
    email: 'naomi.kamau@ueab.ac.ke',
    phone_number: '+254701000004',
    gender: 'Female',
    tribe: 'Kikuyu',
    region: 'Central',
    date_of_birth: new Date('2000-12-30'),
    nationality: 'Kenyan',
    admission_year: 2019,
    year_of_study: 5,
    status: 'Graduated',
    isRegistered: false,
    isOnWorkProgram: true,
    gpa: 3.0,
    credit_hours: 102,
    school: { id: 2 } as any, // School of Education, Humanities and Social Sciences
    department: { id: 3 } as any, // Education
    program: { id: 5 } as any, // BEd in Arts
    residence: { id: 4 } as Residence, // Off Campus Female
  },
  {
    student_id: 1005,
    first_name: 'Tariq',
    last_name: 'Ahmed',
    email: 'tariq.ahmed@ueab.ac.ke',
    phone_number: '+254701000005',
    gender: 'Male',
    tribe: 'Coastal',
    region: 'Coast',
    date_of_birth: new Date('2002-07-07'),
    nationality: 'Kenyan',
    admission_year: 2021,
    year_of_study: 3,
    status: 'Active',
    isRegistered: true,
    isOnWorkProgram: true,
    gpa: 3.1,
    credit_hours: 67,
    school: { id: 4 } as any, // School of Nursing
    department: { id: 8 } as any, // Nursing
    program: { id: 15 } as any, // BSc in Nursing
    residence: { id: 3 } as Residence, // Off Campus Male
  },
];
