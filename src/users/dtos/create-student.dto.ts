export class CreateStudentDto {
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
    status: string;
    created_at: Date;
    school_name?: string;
    department_name?: string;
    program_name?: string;
    program_id?: number;
    department_id?: number;
    residence?: string;
    isOnWorkProgram?: boolean;
    isRegistered?: boolean;
}
