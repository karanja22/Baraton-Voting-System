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

  @Column({ default: true })
  has_positions: boolean;

  @OneToMany(() => Position, p => p.election, { cascade: true })
  positions: Position[];

  @Column({ type: 'enum', enum: ['SEC', 'DELEGATE', 'GENERAL'], default: 'GENERAL' })
  type: 'SEC' | 'DELEGATE' | 'GENERAL';

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;

  getStatus(): 'upcoming' | 'open' | 'closed' {
    const now = new Date();
    if (now < this.start_date) return 'upcoming';
    if (now > this.end_date) return 'closed';
    return 'open';
  }
}
