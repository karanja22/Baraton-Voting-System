import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity()
@Unique(['student_id', 'email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    student_id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;
}
