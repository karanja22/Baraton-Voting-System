import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsOptional, IsDateString, IsString, IsBoolean, ArrayNotEmpty } from 'class-validator';

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
    @IsBoolean()
    has_positions?: boolean;

    @IsOptional()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreatePositionInput)
    positions?: CreatePositionInput[];
}
