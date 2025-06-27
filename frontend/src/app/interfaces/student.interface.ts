export interface StudentInterface {
    student_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    gender?: string;
    tribe?: string;
    region?: string;
    date_of_birth?: Date;
    nationality?: string;
    admission_year?: number;
    year_of_study?: number;
    status?: string;
    created_at?: Date;
    program: { id: number; name: string };
    department: { id: number; name: string };
    school: { id: number; name: string };
    residence?: { id: number; name: string };
    isOnWorkProgram?: boolean;
    isRegistered?: boolean;
    gpa?: number;
    credit_hours?: number;
    hasDisciplinaryIssues?: boolean;
}
