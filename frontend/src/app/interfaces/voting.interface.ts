export interface VoteInterface {
    id: number;
    casted_at: string;
    voter: {
        student_id: number;
        first_name: string;
        last_name: string;
    };
    candidate: {
        id: number;
        full_name: string;
        student: { student_id: number };
    };
    position?: {
        id: number;
        name: string;
    };
    election: {
        id: number;
        title: string;
    };
}

export interface DelegateVoteInterface {
    id: number;
    casted_at: string;
    voter: {
        student_id: number;
        first_name: string;
        last_name: string;
    };
    delegate: {
        id: number;
        full_name: string;
        student: { student_id: number };
        status: 'pending' | 'approved' | 'rejected';
    };
    election: {
        id: number;
        title: string;
    };
}

export interface HasVotedInterface {
    hasVoted: boolean;
}

export interface ElectionResultsInterface {
    election: string;
    position: string;
    results: Array<{
        candidateId: number;
        full_name: string;
        voteCount: number;
    }>;
}

// — Payload shapes for POST requests —

export interface CreateVoteInterface {
    voter_id: number;
    election_id: number;
    candidate_id: number;
    position_id?: number;
}

export interface CreateDelegateVoteInterface {
    voter_id: number;
    election_id: number;
    delegate_id: number;
}
