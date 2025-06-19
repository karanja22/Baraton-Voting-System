import { IsNumber, Min } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('delegate_applications')
export class DelegateApplication {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    full_name: string;

    @Column()
    student_id: number;

    @Column()
    email: string;

    @Column()
    school: string;

    @Column()
    department: string;

    @Column()
    tribe: string;

    @Column()
    gender: string;

    @Column('decimal', { precision: 3, scale: 2 })
    gpa: number;

    @Column()
    year_of_study: number;

    @Column()
    major: string;

    @CreateDateColumn()
    created_at: Date;


    @Column({ default: 'pending' })
    status: 'approved' | 'rejected' | 'pending';

    @IsNumber()
    @Min(0)
    credit_hours: number;

    @Column({ default: false })
    has_disciplinary_issue: boolean;
}
