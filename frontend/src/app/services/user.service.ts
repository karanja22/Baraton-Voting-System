import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = environment.apiUrl;
  private endpoints = environment.users;

  constructor(private http: HttpClient) { }

  getAllStudents(): Observable<any> {
    return this.http.get(`${this.api}${this.endpoints.getAll}`);
  }

  getStudentById(id: number): Observable<any> {
    return this.http.get(`${this.api}${this.endpoints.getById(id)}`);
  }

  updateStudent(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.api}${this.endpoints.update(id)}`, data);
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.api}${this.endpoints.delete(id)}`);
  }
}
