import { IsNumber } from "class-validator";

export class CreateDelegateVoteDto {
    @IsNumber()
    voter_id: number;

    @IsNumber()
    delegate_id: number;

    @IsNumber()
    election_id: number;
}
