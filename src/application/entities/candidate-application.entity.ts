import { IsNumber, Min } from 'class-validator';
import { DelegateApplication } from './delegate-application.entity';
import { Entity, Column, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { Student } from 'src/users/entities/student.entity';
import { Position } from 'src/shared/entities/position.entity';
import { Election } from 'src/elections/entities/election.entity';
import { Residence } from 'src/shared/entities/residence.entity';

@Entity('candidate_applications')
export class CandidateApplication extends DelegateApplication {
    @ManyToOne(() => Residence, { eager: true })
    residence: Residence;

    @ManyToOne(() => Election, { eager: true })
    election: Election;

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
