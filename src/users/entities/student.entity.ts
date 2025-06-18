import {
    Column,
    Entity,
    PrimaryColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity('students')
export class Student {
    @PrimaryColumn()
    student_id: number;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone_number: string;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    tribe: string;

    @Column({ nullable: true })
    region: string;

    @Column({ nullable: true })
    date_of_birth: Date;

    @Column({ nullable: true })
    nationality: string;

    @Column({ nullable: true })
    admission_year: number;

    @Column({ nullable: true })
    year_of_study: number;

    @Column({ nullable: true, default: 'Active' })
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true })
    school_name: string;

    @Column({ nullable: true })
    department_name: string;

    @Column({ nullable: true })
    program_name: string;

    @Column({ nullable: true })
    program_id: number;

    @Column({ nullable: true })
    department_id: number;

    @Column({ nullable: true })
    residence: string;

    @Column({ default: false })
    isOnWorkProgram: boolean;

    @Column({ default: false })
    isRegistered: boolean;
}
