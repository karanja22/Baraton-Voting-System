import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Role } from '../../enums/role.enum'; // adjust path as needed
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  identifier: string;
  role: Role;
  // add more if needed
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    identifier: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  error = '';
  loading = false;
  showPassword = false;
  matchPasswords(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }



  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;

    this.authService.login(this.form.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.data) {
            const accessToken = res.data.access_token;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', res.data.refresh_token);

            const decoded = jwtDecode<TokenPayload>(accessToken);
            console.log('Decoded token:', decoded);

            switch (decoded.role) {
              case Role.VOTER:
                this.router.navigate(['/voter']);
                break;
              case Role.ADMIN:
                this.router.navigate(['/admin']);
                break;
              case Role.ELECTORAL_COMMISSION:
                this.router.navigate(['/electrol-commision']);
                break;
              default:
                this.error = 'Unknown role. Contact system admin.';
            }
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Login failed';
        }
      });
  }
}
