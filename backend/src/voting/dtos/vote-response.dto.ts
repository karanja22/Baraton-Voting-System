export class VoteResponseDto {
    id: number;
    casted_at: Date;
    voter: {
        student_id: number;
        full_name: string;
    };
    candidate: {
        full_name: string;
        student_id?: number;
    };
    position: {
        name: string;
    };
    election: {
        title: string;
    };
}
