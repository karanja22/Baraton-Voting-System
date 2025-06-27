import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../../services/application.service';
import { UserService } from '../../../services/user.service';
import { ElectionService } from '../../../services/elections.service';
import { StudentInterface } from '../../../interfaces/student.interface';
import { ElectionInterface } from '../../../interfaces/elections.interface';
import { PositionInterface } from '../../../interfaces/position.interface';
import { CreateCandidateInterface } from '../../../interfaces/create-candiate.interfae';
import { MessageBannerComponent } from '../../../components/message-banner/message-banner.component';

@Component({
  selector: 'app-candidate-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MessageBannerComponent],
  templateUrl: './candidate-application.component.html',
  styleUrl: './candidate-application.component.css',
})
export class CandidateApplicationComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private userService = inject(UserService);
  private appService = inject(ApplicationService);
  private electionService = inject(ElectionService);

  form!: FormGroup;
  elections: ElectionInterface[] = [];
  positions: PositionInterface[] = [];

  applicationStatus: 'pending' | 'approved' | 'rejected' | null = null;
  message: string | null = null;
  messageType: 'success' | 'error' = 'success';
  imageFile: File | null = null;
  loading = false;

  ngOnInit() {
    this.initForm();
    this.fetchStudentData();
    this.fetchDropdowns();
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
      nationality: new FormControl('', Validators.required),
      election_id: new FormControl('', Validators.required),
      position_id: new FormControl('', Validators.required),
      vice_president_id: new FormControl({ value: '', disabled: true }),
      photo: new FormControl(null),
    });

    this.form.get('election_id')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(electionId => {
        const selected = this.elections.find(e => e.id === +electionId);
        this.positions = selected?.positions || [];
        this.form.get('position_id')?.reset();
      });

    this.form.get('position_id')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(positionId => {
        const selected = this.positions.find(p => p.id === +positionId);
        const isPresident = selected?.name?.toLowerCase() === 'president';
        const vpControl = this.form.get('vice_president_id');

        if (isPresident) {
          vpControl?.enable();
          vpControl?.setValidators(Validators.required);
        } else {
          vpControl?.reset();
          vpControl?.clearValidators();
          vpControl?.disable();
        }

        vpControl?.updateValueAndValidity();
      });
  }

  private fetchStudentData() {
    const studentId = this.getStudentIdFromToken();
    if (!studentId) return;

    this.userService.getStudentById(studentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          const student: StudentInterface = res.data;
          this.form.patchValue({
            student_id: student.student_id,
            full_name: `${student.first_name} ${student.last_name}`,
            email: student.email,
            gender: student.gender,
            tribe: student.tribe,
            gpa: student.gpa,
            credit_hours: student.credit_hours,
            year_of_study: student.year_of_study,
            school: student.school?.name,
            department: student.department?.name,
            program: student.program?.name,
          });

          this.appService.getCandidateById(studentId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: res => {
                this.applicationStatus = res?.status || 'pending';
              },
              error: err => {
                if (err.status === 404) {
                  this.applicationStatus = null;
                } else {
                  console.error('Error fetching candidate application:', err);
                }
              }
            });
        },
        error: err => console.error('Error fetching student:', err)
      });
  }

  private fetchDropdowns() {
    this.electionService.getAllElections()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.elections = Array.isArray(res) ? res : res?.data || [];
        },
        error: err => console.error('Failed to fetch elections:', err)
      });
  }

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    this.imageFile = file || null;
  }

  onSubmit() {
    if (this.form.invalid) return;

    const formData = new FormData();
    const studentId = this.form.getRawValue().student_id;

    const payload: CreateCandidateInterface = {
      student_id: studentId,
      election_id: +this.form.get('election_id')?.value,
      position_id: +this.form.get('position_id')?.value,
      nationality: this.form.get('nationality')?.value,
      vice_president_id: this.form.get('vice_president_id')?.enabled
        ? +this.form.get('vice_president_id')?.value
        : undefined,
    };

    formData.append('payload', JSON.stringify(payload));
    if (this.imageFile) formData.append('photo', this.imageFile);

    this.loading = true;

    this.appService.submitCandidate(formData)
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
}
