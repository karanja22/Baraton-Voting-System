import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';


export class CreateStudentDto {
  @IsNumber()
  student_id: number;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  tribe?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date_of_birth?: Date;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsNumber()
  admission_year?: number;

  @IsOptional()
  @IsNumber()
  year_of_study?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDate()
  created_at?: Date;

  @IsNumber()
  program_id: number;

  @IsNumber()
  department_id: number;

  @IsNumber()
  school_id: number;

  @IsOptional()
  @IsNumber()
  residence_id?: number;

  @IsOptional()
  @IsBoolean()
  isOnWorkProgram?: boolean;

  @IsOptional()
  @IsBoolean()
  isRegistered?: boolean;

  @IsOptional()
  @IsBoolean()
  hasDisciplinaryIssues?: boolean;

  @IsOptional()
  @IsNumber()
  gpa?: number;

  @IsOptional()
  @IsNumber()
  credit_hours?: number;
}
