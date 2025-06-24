import { IsNumber, Min } from 'class-validator';
import { DelegateApplication } from './delegate-application.entity';
import { Entity, Column, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { Student } from 'src/users/entities/student.entity';
import { Position } from 'src/shared/entities/position.entity';

@Entity('candidate_applications')
export class CandidateApplication extends DelegateApplication {
    @Column()
    residence: string;

    @ManyToOne(() => Position, { eager: true })
    position: Position

    @Column()
    nationality: string;

    @OneToOne(() => Student)
    @JoinColumn({ name: 'vice_president_id' })
    vice_president: Student;

    @Column({ nullable: true })
    vice_president_gender: string;


}
