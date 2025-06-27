import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private api = environment.apiUrl;
  private endpoints = environment.applications;

  constructor(private http: HttpClient) { }

  // === Delegate ===
  submitDelegate(data: any): Observable<any> {
    return this.http.post(`${this.api}${this.endpoints.delegate.create}`, data);
  }

  getAllDelegates(): Observable<any> {
    return this.http.get(`${this.api}${this.endpoints.delegate.getAll}`);
  }

  getDelegateById(id: number): Observable<any> {
    return this.http.get(`${this.api}${this.endpoints.delegate.getById(id)}`);
  }

  updateDelegate(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.api}${this.endpoints.delegate.update(id)}`, data);
  }

  deleteDelegate(id: number): Observable<any> {
    return this.http.delete(`${this.api}${this.endpoints.delegate.delete(id)}`);
  }

  // === Candidate ===
  submitCandidate(data: any): Observable<any> {
    return this.http.post(`${this.api}${this.endpoints.candidate.create}`, data);
  }

  getAllCandidates(): Observable<any> {
    return this.http.get(`${this.api}${this.endpoints.candidate.getAll}`);
  }

  getCandidateById(id: number): Observable<any> {
    return this.http.get(`${this.api}${this.endpoints.candidate.getById(id)}`);
  }

  updateCandidate(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.api}${this.endpoints.candidate.update(id)}`, data);
  }

  deleteCandidate(id: number): Observable<any> {
    return this.http.delete(`${this.api}${this.endpoints.candidate.delete(id)}`);
  }
}
