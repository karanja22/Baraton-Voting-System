import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsOptional, IsDateString, IsString } from 'class-validator';

class CreatePositionInput {
    @IsString()
    name: string;

    @IsOptional()
    isVicePosition?: boolean;
}

export class CreateElectionDto {
    @IsString()
    title: string;

    @IsDateString()
    start_date: Date;

    @IsDateString()
    end_date: Date;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePositionInput)
    positions?: CreatePositionInput[];
}
