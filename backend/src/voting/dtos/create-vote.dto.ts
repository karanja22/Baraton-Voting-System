// src/votes/dto/create-vote.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateVoteDto {
  @IsNumber()
  @IsNotEmpty()
  voter_id: number;

  @IsNumber()
  @IsNotEmpty()
  candidate_id: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  position_id?: number;

  @IsNumber()
  @IsNotEmpty()
  election_id: number;
}
