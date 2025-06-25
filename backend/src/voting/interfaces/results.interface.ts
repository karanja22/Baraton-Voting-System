export interface CandidateResult {
    candidateId: number;
    full_name: string;
    voteCount: number;
}

export interface ElectionResultsInterface {
    election: string;
    position: string;
    results: CandidateResult[];
}
