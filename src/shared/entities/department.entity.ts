import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { School } from './school.entity';
import { Program } from './program.entity'; 

@Entity()
export class Department {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => School, school => school.departments, { onDelete: 'CASCADE' })
    school: School;

    @OneToMany(() => Program, program => program.department)
    progams: Program[];
}
