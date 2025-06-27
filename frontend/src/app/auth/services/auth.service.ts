import { Injectable } from '@angular/core';
import { LoginInterface } from '../interfaces/login-interface';
import { RegisterInterface } from '../interfaces/register-interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RefreshInterface } from '../interfaces/refresh-interface';
import { ApiResponse, AuthTokens, RefreshResponse } from '../interfaces/auth-interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) { }


  login(data: LoginInterface): Observable<ApiResponse<AuthTokens>> {
    return this.http.post<ApiResponse<AuthTokens>>(
      `${this.base}${environment.auth.login}`,
      data
    );
  }

  register(data: RegisterInterface): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.base}${environment.auth.register}`,
      data
    );
  }

  refreshToken(data: RefreshInterface): Observable<ApiResponse<RefreshResponse>> {
    const accessToken = localStorage.getItem('accessToken') ?? '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);

    return this.http.post<ApiResponse<RefreshResponse>>(
      `${this.base}${environment.auth.refresh}`,
      data,
      { headers }
    );
  }

  logout(): Observable<ApiResponse<null>> {
    const accessToken = localStorage.getItem('accessToken') ?? '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);

    return this.http.post<ApiResponse<null>>(
      `${this.base}${environment.auth.logout}`,
      {},
      { headers }
    );
  }
}
