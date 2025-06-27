import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateElectionInterface, ElectionInterface, UpdateElectionInterface } from '../interfaces/elections.interface';
import { HttpResponseInterface } from '../interfaces/http-response.interface';


@Injectable({
    providedIn: 'root'
})
export class ElectionService {
    private baseUrl = `${environment.apiUrl}/elections`;

    constructor(private http: HttpClient) { }

    /** Create a new election */
    createElection(
        payload: CreateElectionInterface
    ): Observable<HttpResponseInterface<ElectionInterface>> {
        return this.http.post<HttpResponseInterface<ElectionInterface>>(
            this.baseUrl,
            payload
        );
    }

    /** Fetch all elections */
    getAllElections(): Observable<HttpResponseInterface<ElectionInterface[]>> {
        return this.http.get<HttpResponseInterface<ElectionInterface[]>>(
            this.baseUrl
        );
    }

    /** Fetch one election by ID */
    getElectionById(
        id: number
    ): Observable<HttpResponseInterface<ElectionInterface>> {
        return this.http.get<HttpResponseInterface<ElectionInterface>>(
            `${this.baseUrl}/${id}`
        );
    }

    /** Update an existing election */
    updateElection(
        id: number,
        payload: UpdateElectionInterface
    ): Observable<HttpResponseInterface<ElectionInterface>> {
        return this.http.patch<HttpResponseInterface<ElectionInterface>>(
            `${this.baseUrl}/${id}`,
            payload
        );
    }

    /** Delete an election */
    deleteElection(id: number): Observable<HttpResponseInterface<null>> {
        return this.http.delete<HttpResponseInterface<null>>(
            `${this.baseUrl}/${id}`
        );
    }
}
