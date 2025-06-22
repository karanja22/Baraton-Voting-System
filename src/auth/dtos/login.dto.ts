import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    student_id: string;

    @IsNotEmpty()
    @IsString()
    @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
    password: string;
}
