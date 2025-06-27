import { StudentInterface } from './student.interface';

export interface CandidateInterface {
    id: number;
    student: StudentInterface;
    election: {
        id: number;
        name: string;
    };
    position: {
        id: number;
        title: string;
    };
    residence: {
        id: number;
        name: string;
    };
    nationality: string;
    vice_president?: StudentInterface;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}
