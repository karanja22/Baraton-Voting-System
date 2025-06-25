import { IsNumber, Min } from 'class-validator';
import { Department } from 'src/shared/entities/department.entity';
import { Program } from 'src/shared/entities/program.entity';
import { School } from 'src/shared/entities/school.entity';
import { Student } from 'src/users/entities/student.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
} from 'typeorm';


@Entity('delegate_applications')
export class DelegateApplication {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    full_name: string;

    @ManyToOne(() => Student, { eager: true })
    student: Student;

    @Column()
    email: string;

    @ManyToOne(() => School, { eager: true, nullable: true })
    school: School;

    @ManyToOne(() => Department, { eager: true, nullable: true })
    department: Department;

    @Column({ nullable: true })
    tribe: string;

    @Column()
    gender: string;

    @Column('decimal', { precision: 3, scale: 2 })
    gpa: number;

    @Column()
    year_of_study: number;

    @ManyToOne(() => Program, { eager: true, nullable: true })
    program: Program;

    @CreateDateColumn()
    created_at: Date;

    @Column({ default: 'pending' })
    status: 'approved' | 'rejected' | 'pending';

    @IsNumber()
    @Min(0)
    @Column({ default: 0 })
    credit_hours: number;

    @Column({ default: false })
    has_disciplinary_issue: boolean;

    @Column({ default: false })
    isSelected: boolean;


}
