import { IsNotEmpty, IsOptional, IsPositive, IsNumber, IsString } from 'class-validator';
import { CreateDelegateDto } from './create-delegate.dto';

export class CreateCandidateDto extends CreateDelegateDto {

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  election_id: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  position_id: number;

  @IsString()
  @IsNotEmpty()
  nationality: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  vice_president_id?: number;
}
