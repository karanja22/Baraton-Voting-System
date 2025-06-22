import { PartialType } from '@nestjs/mapped-types';
import { CreateElectionDto } from './create-election.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateElectionDto extends PartialType(CreateElectionDto) {
    @IsOptional()
    @IsString()
    status?: string;
}
