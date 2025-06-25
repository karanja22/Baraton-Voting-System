import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Role } from 'src/users/roles.enum';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(3, 20, { message: 'Identifier must be between 3 and 20 characters' })
    identifier: string;

    @IsString()
    @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
    password: string;

    @IsOptional()
    @IsEnum(Role, { message: 'Role must be VOTER, ADMIN, or ELECTORAL_COMMISSION' })
    role?: Role;
}
