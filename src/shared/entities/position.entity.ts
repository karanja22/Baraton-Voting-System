import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Election} from 'src/elections/entities/election.entity.ts';

@Entity()
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Election, election => election.positions, { onDelete: 'CASCADE' })
  election: Election;

  @OneToMany(() => CandidateApplication, candidate => candidate.position)
  candidates: CandidateApplication[];

  @Column({ default: false })
  isVicePosition?: boolean; // Optional flag for special cases
}
