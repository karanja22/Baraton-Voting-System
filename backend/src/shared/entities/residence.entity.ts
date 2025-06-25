import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';import { Student } from 'src/users/entities/student.entity';

@Entity('residences')
export class Residence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Student, student => student.residence)
  students: Student[];
}