import { StudentInterface } from "./student.interface";
export interface DelegateApplicationInterface {
    id: number;
    full_name: string;
    student: StudentInterface;
    email: string;
    gender: string;
    tribe: string;
    gpa: number;
    year_of_study: number;
    credit_hours: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    department: { id: number; name: string };
    program: { id: number; name: string };
    school: { id: number; name: string };
}
