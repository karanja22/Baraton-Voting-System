import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  Min,
  Max,
  IsPositive,
} from 'class-validator';

export class CreateDelegateDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  student_id: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  school_id: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  department_id: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  program_id: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(4)
  @IsNotEmpty()
  gpa: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  year_of_study: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  credit_hours: number;
}
