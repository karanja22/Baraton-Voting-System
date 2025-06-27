import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private apiUrl = `${environment.apiUrl}/media/upload`;

  constructor(private http: HttpClient) { }

  uploadImage(file: File, studentId: number): Observable<{ photo_url: string; cloudinary_public_id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', studentId.toString());

    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`
    });

    return this.http.post<{ photo_url: string; cloudinary_public_id: string }>(
      this.apiUrl,
      formData,
      { headers }
    );
  }
}
