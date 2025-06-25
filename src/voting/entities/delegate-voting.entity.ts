import { DelegateApplication } from "src/application/entities/delegate-application.entity";
import { Election } from "src/elections/entities/election.entity";
import { Student } from "src/users/entities/student.entity";
import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";

@Entity('delegate_votes')
export class DelegateVote {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, { eager: true })
    voter: Student;

    @ManyToOne(() => DelegateApplication, { eager: true })
    delegate: DelegateApplication;

    @ManyToOne(() => Election, { eager: true })
    election: Election;

    @CreateDateColumn()
    casted_at: Date;
}
