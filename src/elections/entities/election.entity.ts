import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Position } from 'src/shared/entities/position.entity';

@Entity()
export class Election {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: true })
  has_positions: boolean;

  @OneToMany(() => Position, p => p.election, { cascade: true })
  positions: Position[];

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}
