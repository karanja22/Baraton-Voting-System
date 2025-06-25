import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from 'typeorm';
import { Role } from 'src/users/roles.enum';
import { Student } from './student.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: Role, default: Role.VOTER })
    role: Role;

    @Column({ unique: true })
    identifier: string;

    @OneToOne(() => Student, { nullable: true })
    @JoinColumn({ name: 'student_id', referencedColumnName: 'student_id' })
    student?: Student;
}
