import { PartialType } from '@nestjs/mapped-types';
import { CreateElectionDto} from 'src/elections/dtos/CreateElection.dto';

export class UpdateElectionDto extend PartialType(CreateElectionDto){
    status?: string;
}
