import { CreateDelegateDto } from "./create-delegate.dto";


export class CreateCandidateDto extends CreateDelegateDto {
    residence: string;
    position: string;
    nationality: string;
    vice_president_id: number

}
