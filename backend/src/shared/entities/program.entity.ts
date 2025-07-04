import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Department } from './department.entity';

@Entity()
export class Program {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Department, department => department.progams, { onDelete: 'CASCADE' })
    department: Department;
}
