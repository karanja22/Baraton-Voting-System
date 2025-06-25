import { CandidateApplication } from 'src/application/entities/candidate-application.entity';
import { Election } from 'src/elections/entities/election.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { School } from './school.entity';

@Entity()
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Election, election => election.positions, { onDelete: 'CASCADE', nullable: true })
  election: Election;

  @ManyToOne(() => School, { nullable: true })
  school?: School;

  @OneToMany(() => CandidateApplication, candidate => candidate.position, { cascade: true })
  candidates?: CandidateApplication[];


  @Column({ default: false })
  isVicePosition?: boolean;
}
