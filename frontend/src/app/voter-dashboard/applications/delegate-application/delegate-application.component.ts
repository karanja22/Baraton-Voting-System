import { Component, inject, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApplicationService } from '../../../services/application.service';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { StudentInterface } from '../../../interfaces/student.interface';
import { CreateDelegateInterface } from '../../../interfaces/create-delegate.interface';

@Component({
  selector: 'app-delegate-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './delegate-application.component.html',
  styleUrl: './delegate-application.component.css',
})
export class DelegateApplicationComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private appService = inject(ApplicationService);
  private userService = inject(UserService);

  form!: FormGroup;
  loading = false;
  applicationStatus: 'pending' | 'approved' | 'rejected' | null = null;

  constructor() {
    this.initForm();
    this.fetchUserDataAndApplicationStatus();
  }

  private initForm() {
    this.form = this.fb.group({
      student_id: new FormControl({ value: '', disabled: true }, Validators.required),
      full_name: new FormControl({ value: '', disabled: true }, Validators.required),
      email: new FormControl({ value: '', disabled: true }, Validators.required),
      gender: new FormControl({ value: '', disabled: true }),
      tribe: new FormControl({ value: '', disabled: true }),
      gpa: new FormControl({ value: '', disabled: true }),
      credit_hours: new FormControl({ value: '', disabled: true }),
      year_of_study: new FormControl({ value: '', disabled: true }),
      school: new FormControl({ value: '', disabled: true }),
      department: new FormControl({ value: '', disabled: true }),
      program: new FormControl({ value: '', disabled: true }),
    });
  }

  private fetchUserDataAndApplicationStatus() {
    const studentId = this.getStudentIdFromToken();
    if (!studentId) return;

    this.userService.getStudentById(studentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data: StudentInterface = res.data;

          this.form.patchValue({
            student_id: data.student_id,
            full_name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            gender: data.gender,
            tribe: data.tribe,
            gpa: data.gpa,
            credit_hours: data.credit_hours,
            year_of_study: data.year_of_study,
            school: data.school?.name,
            department: data.department?.name,
            program: data.program?.name,
          });

          // Check if user already applied as delegate
          this.appService.getDelegateById(studentId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (res) => {
                this.applicationStatus = res?.status || 'pending'; // fallback to pending if status missing
              },
              error: (err) => {
                if (err.status === 404) {
                  this.applicationStatus = null; // Not applied yet
                } else {
                  console.error('Failed to fetch delegate application:', err);
                }
              }
            });
        },
        error: (err) => console.error('Failed to fetch student data:', err)
      });
  }

  onSubmit() {
    const student_id = this.form.getRawValue().student_id;
    const payload: CreateDelegateInterface = { student_id };

    this.loading = true;

    this.appService.submitDelegate(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          console.log('Application submitted:', res);
          this.applicationStatus = 'pending';
          this.loading = false;
        },
        error: (err) => {
          console.error('Error submitting delegate application:', err);
          this.loading = false;
        }
      });
  }

  private getStudentIdFromToken(): number {
    const token = localStorage.getItem('accessToken');
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload.identifier);
    } catch (e) {
      console.warn('Invalid token:', e);
      return 0;
    }
  }
}
