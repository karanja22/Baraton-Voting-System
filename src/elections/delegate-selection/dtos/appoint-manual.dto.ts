import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AppointManualDto {
    @IsInt()
    @Min(1)
    departmentId: number;

    @IsArray()
    @IsInt({ each: true })
    selectedIds: number[];
}
