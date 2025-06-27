import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentInterface } from '../../../interfaces/student.interface';
import { ApplicationService } from '../../../services/application.service';
import { UserService } from '../../../services/user.service';
import { ElectionService } from '../../../services/elections.service';
import { PositionInterface } from '../../../interfaces/position.interface';
import { CreateCandidateInterface } from '../../../interfaces/create-candiate.interfae';
import { ElectionInterface } from '../../../interfaces/elections.interface';

@Component({
  selector: 'app-candidate-application',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
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
  loading = false;
  applicationStatus: 'pending' | 'approved' | 'rejected' | null = null;

  elections: ElectionInterface[] = [];
  positions: PositionInterface[] = [];

  ngOnInit() {
    this.initForm();
    this.fetchUserData();
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
    });

    this.form.get('election_id')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((electionId) => {
        const selected = this.elections.find(e => e.id === +electionId);
        this.positions = selected?.positions || [];
        this.form.get('position_id')?.reset();
      });

    this.form.get('position_id')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((positionId) => {
        const selectedPosition = this.positions.find(p => p.id === +positionId);
        const isPresident = selectedPosition?.name?.toLowerCase() === 'president';
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

  private fetchUserData() {
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
        },
        error: (err) => console.error('Failed to fetch student data:', err),
      });
  }

  private fetchDropdowns() {
    this.electionService.getAllElections()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.elections = Array.isArray(res) ? res : (res?.data ?? []);
        },
        error: (err) => console.error('Failed to load elections:', err)
      });

    // Watch for election change
    this.form.get('election_id')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((electionId) => {
        this.loadPositionsForElection(electionId);
      });
  }

  private loadPositionsForElection(electionId: number) {
    const selected = this.elections.find(e => e.id === +electionId);
    this.positions = selected?.positions || [];
  }


  onSubmit() {
    if (this.form.invalid) return;

    const payload: CreateCandidateInterface = {
      student_id: this.form.getRawValue().student_id,
      election_id: +this.form.get('election_id')?.value,
      position_id: +this.form.get('position_id')?.value,
      nationality: this.form.get('nationality')?.value,
      vice_president_id: this.form.get('vice_president_id')?.enabled
        ? +this.form.get('vice_president_id')?.value
        : undefined,
    };

    this.appService.submitCandidate(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          console.log('Candidate Application Submitted:', res);
          this.applicationStatus = 'pending';
        },
        error: (err) => console.error('Candidate submission error:', err),
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
