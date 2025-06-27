import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpResponseInterface } from '../interfaces/http-response.interface';
import { CreateVoteInterface, VoteInterface, CreateDelegateVoteInterface, DelegateVoteInterface, HasVotedInterface, ElectionResultsInterface } from '../interfaces/voting.interface';

@Injectable({
  providedIn: 'root'
})
export class VotingService {
  private readonly base = `${environment.apiUrl}/voting`;

  constructor(private http: HttpClient) { }

  /** Cast a vote for a candidate */
  castCandidateVote(
    payload: CreateVoteInterface
  ): Observable<HttpResponseInterface<VoteInterface>> {
    return this.http.post<HttpResponseInterface<VoteInterface>>(
      `${this.base}/candidate`,
      payload
    );
  }

  /** Cast a vote for a delegate */
  castDelegateVote(
    payload: CreateDelegateVoteInterface
  ): Observable<HttpResponseInterface<DelegateVoteInterface>> {
    return this.http.post<HttpResponseInterface<DelegateVoteInterface>>(
      `${this.base}/delegate`,
      payload
    );
  }

  /** Check if a voter has already voted in a given election/position */
  hasVoted(
    voter_id: number,
    position_id: number,
    election_id: number
  ): Observable<HttpResponseInterface<HasVotedInterface>> {
    const params = new HttpParams()
      .set('voter_id', voter_id.toString())
      .set('position_id', position_id.toString())
      .set('election_id', election_id.toString());

    return this.http.get<HttpResponseInterface<HasVotedInterface>>(
      `${this.base}/has-voted`,
      { params }
    );
  }

  /** Get all raw votes */
  getAllVotes(): Observable<HttpResponseInterface<VoteInterface[]>> {
    return this.http.get<HttpResponseInterface<VoteInterface[]>>(
      `${this.base}`
    );
  }

  /** Get a single vote by its ID */
  getVoteById(
    id: number
  ): Observable<HttpResponseInterface<VoteInterface>> {
    return this.http.get<HttpResponseInterface<VoteInterface>>(
      `${this.base}/${id}`
    );
  }

  /** Get structured results for a position in an election */
  getCandidateResults(
    electionId: number,
    positionId: number
  ): Observable<HttpResponseInterface<ElectionResultsInterface>> {
    return this.http.get<HttpResponseInterface<ElectionResultsInterface>>(
      `${this.base}/candidate-results/${electionId}/${positionId}`
    );
  }

  /** Get unstructured delegate election results */
  getDelegateResults(
    electionId: number
  ): Observable<
    HttpResponseInterface<
      Array<{ delegateId: number; full_name: string; voteCount: number }>
    >
  > {
    return this.http.get<
      HttpResponseInterface<
        Array<{ delegateId: number; full_name: string; voteCount: number }>
      >
    >(`${this.base}/delegate-results/${electionId}`);
  }

}

