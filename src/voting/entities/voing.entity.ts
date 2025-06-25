// src/votes/entities/vote.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    Unique
} from 'typeorm';
import { Student } from 'src/users/entities/student.entity';
import { CandidateApplication } from 'src/application/entities/candidate-application.entity';
import { Position } from 'src/shared/entities/position.entity';
import { Election } from 'src/elections/entities/election.entity';

@Entity()
@Unique(['voter', 'position', 'election']) // prevents duplicate votes per position in an election
export class Vote {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, { eager: true, onDelete: 'CASCADE' })
    voter: Student;

    @ManyToOne(() => CandidateApplication, { eager: true, onDelete: 'CASCADE' })
    candidate: CandidateApplication;

    @ManyToOne(() => Position, { nullable: true, onDelete: 'CASCADE' })
    position: Position;

    @ManyToOne(() => Election, { eager: true, onDelete: 'CASCADE' })
    election: Election;

    @CreateDateColumn()
    casted_at: Date;
}
