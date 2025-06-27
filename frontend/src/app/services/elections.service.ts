import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateElectionInterface, ElectionInterface, UpdateElectionInterface } from '../interfaces/elections.interface';


@Injectable({
    providedIn: 'root'
})
export class ElectionService {
    private api = `${environment.apiUrl}/elections`;

    constructor(private http: HttpClient) { }

    // Create a new election
    createElection(data: CreateElectionInterface): Observable<ElectionInterface> {
        return this.http.post<ElectionInterface>(this.api, data);
    }

    // Get all elections
    getAllElections(): Observable<ElectionInterface[]> {
        return this.http.get<ElectionInterface[]>(this.api);
    }

    // Get election by ID
    getElectionById(id: number): Observable<ElectionInterface> {
        return this.http.get<ElectionInterface>(`${this.api}/${id}`);
    }

    // Update election
    updateElection(id: number, data: UpdateElectionInterface): Observable<ElectionInterface> {
        return this.http.patch<ElectionInterface>(`${this.api}/${id}`, data);
    }

    // Delete election
    deleteElection(id: number): Observable<any> {
        return this.http.delete(`${this.api}/${id}`);
    }
}
