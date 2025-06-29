import { Component, inject, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApplicationService } from '../../../services/application.service';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { StudentInterface } from '../../../interfaces/student.interface';
import { CreateDelegateInterface } from '../../../interfaces/create-delegate.interface';
import { MessageBannerComponent } from '../../../components/message-banner/message-banner.component';

@Component({
  selector: 'app-delegate-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MessageBannerComponent],
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
  message: string | null = null;
  messageType: 'success' | 'error' = 'success';
  imageFile: File | null = null;

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

          this.appService.getDelegateById(studentId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (res) => {
                this.applicationStatus = res?.status ?? null;
              },
              error: (err) => {
                if (err.status === 404) {
                  this.applicationStatus = null;
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
    if (!this.form.valid) return;

    const formData = new FormData();
    const studentId = this.form.getRawValue().student_id;

    const payload: CreateDelegateInterface = {
      student_id: studentId,
      photo_url: '' // Provide an appropriate value or update logic to set the actual photo URL if available
    };

    formData.append('payload', JSON.stringify(payload));
    if (this.imageFile) formData.append('file', this.imageFile);

    this.loading = true;

    this.appService.submitDelegate(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.message = res.message;
          this.messageType = res.statusCode === 201 ? 'success' : 'error';
          this.applicationStatus = 'pending';
          this.loading = false;
        },
        error: err => {
          this.message = err?.error?.message || 'Something went wrong';
          this.messageType = 'error';
          this.loading = false;
        }
      });
  }

  private getStudentIdFromToken(): number {
    const token = localStorage.getItem('accessToken');
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload.identifier, 10);
    } catch (e) {
      console.warn('Invalid token payload:', e);
      return 0;
    }
  }
  imagePreview: string | null = null;

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    this.imageFile = file || null;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    } else {
      this.imagePreview = null;
    }
  }


}
