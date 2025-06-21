import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Program } from 'src/shared/entities/program.entity';
import { Residence } from 'src/shared/entities/residence.entity';
import { School } from 'src/shared/entities/school.entity';
import { Department } from 'src/shared/entities/department.entity';


@Entity('students')
export class Student {
  @PrimaryColumn()
  student_id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  tribe: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  date_of_birth: Date;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  admission_year: number;

  @Column({ nullable: true })
  year_of_study: number;

  @Column({ nullable: true, default: 'Active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Program, { eager: true })
  program: Program;

  @ManyToOne(() => Department, { eager: true })
  department: Department;

  @ManyToOne(() => School, { eager: true })
  school: School;

  @Column('float', { nullable: true })
  gpa: number;

  @Column('int', { nullable: true })
  credit_hours: number;

  @ManyToOne(() => Residence)
  residence: Residence;

  @Column({ default: false })
  isOnWorkProgram: boolean;

  @Column({ default: false })
  isRegistered: boolean;

  @Column({ default: false })
  hasDisciplinaryIssues: boolean;
}
