import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateDelegateDto } from './create-delegate.dto';

export class CreateCandidateDto extends CreateDelegateDto {
  @IsString()
  residence: string;

  @IsNumber()
  position_id: number;

  @IsString()
  nationality: string;

  @IsNumber()
  @IsOptional()
  vice_president_id: number;
}
