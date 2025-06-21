export class CreateElectionDto {
    title: string;
    start_date: Date;
    end_date: Date;
    positions?: CreatePositionDto[];
}

