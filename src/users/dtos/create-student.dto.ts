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
  status?: string; 
  created_at?: Date; 
  program_id: number;
  department_id: number;
  school_id: number;
  residence_id?: number;
  isOnWorkProgram?: boolean;
  isRegistered?: boolean;
  hasDisciplinaryIssues?: boolean;
  gpa?: number;
  credit_hours?: number;
}
