import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(10)
    student_id: string;

    @IsString()
    @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
    password: string;
}
