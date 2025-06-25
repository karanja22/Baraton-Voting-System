import { IsNotEmpty, IsPositive, IsNumber } from 'class-validator';

export class CreateDelegateDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  student_id: number;
}
