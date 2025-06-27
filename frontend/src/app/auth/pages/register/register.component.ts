import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Role } from '../../enums/role.enum';
import { CommonModule } from '@angular/common';
import { RegisterInterface } from '../../interfaces/register-interface';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    identifier: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.matchPasswords });

  showPassword = false;

  // Validator to compare password and confirmPassword
  matchPasswords(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }


  loading = false;
  error = '';
  success = '';

  roles = Object.values(Role); // ['VOTER', 'ADMIN', 'ELECTORAL_COMMISSION']

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;

    const { confirmPassword, ...rest } = this.form.value;

    const registerData: RegisterInterface = rest;

    this.authService.register(registerData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.success = res.message;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Registration failed';
        }
      });
  }

}
