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
  submitDelegate(data: any, file?: File): Observable<any> {
    const formData = new FormData();

    if (file) {
      formData.append('file', file);
    }

    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    }

    return this.http.post(`${this.api}${this.endpoints.delegate.create}`, formData);
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
  submitCandidate(data: any, file?: File): Observable<any> {
    const formData = new FormData();

    // Append file only if it exists
    if (file) {
      formData.append('file', file);
    }

    // Append all candidate fields to FormData
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    }

    return this.http.post(`${this.api}${this.endpoints.candidate.create}`, formData);
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
