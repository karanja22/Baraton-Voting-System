import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApplicationService } from '../../../services/application.service';
import { VotingService } from '../../../services/voting.service';
import { MessageBannerComponent } from '../../../components/message-banner/message-banner.component';

interface Candidate {
  id: number;
  full_name: string;
  election: { id: number };
  position?: { id: number };
}

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MessageBannerComponent],
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css'],
})
export class CandidatesComponent implements OnInit {
  // injected services
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appService = inject(ApplicationService);
  private votingService = inject(VotingService);

  // component state
  electionId!: number;
  positionId!: number | 'none';
  candidates: Candidate[] = [];
  form!: FormGroup;
  loading = true;
  error = '';

  // notification for banner
  notification: { text: string; type: 'success' | 'error' | 'info' | 'warning' } | null = null;

  ngOnInit() {
    // 1) Grab route params
    this.electionId = Number(this.route.snapshot.paramMap.get('electionId'));
    const pos = this.route.snapshot.paramMap.get('positionId');
    this.positionId = pos === 'none' ? 'none' : Number(pos);

    // 2) Build the form
    this.form = this.fb.group({
      candidate_id: [null, Validators.required],
    });

    // 3) Load & filter candidates
    this.appService.getAllCandidates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.candidates = (res.data || []).filter((c: Candidate) =>
            c.election.id === this.electionId
            && (this.positionId === 'none' || c.position?.id === this.positionId)
          );
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Could not load candidates';
          this.loading = false;
        }
      });
  }

  castVote() {
    if (this.form.invalid) return;

    const candidate_id = this.form.value.candidate_id;
    const payload = {
      voter_id: this.getStudentIdFromToken(),
      election_id: this.electionId,
      candidate_id,
      position_id: this.positionId === 'none' ? undefined : this.positionId,
    };

    this.votingService.castCandidateVote(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          // show success banner
          this.notification = { text: resp.message, type: 'success' };
          // optionally redirect after a short delay:
          setTimeout(() => this.router.navigate(['/voter/results']), 2000);
        },
        error: (err) => {
          console.error(err);
          this.notification = {
            text: err.error?.message || 'Failed to cast vote',
            type: 'error'
          };
        }
      });
  }
  goBack() {
    this.router.navigate([`/voter/voting/${this.electionId}/positions`]);
  }

  dismissNotification() {
    this.notification = null;
  }

  private getStudentIdFromToken(): number {
    const token = localStorage.getItem('accessToken')!;
    try {
      return parseInt(JSON.parse(atob(token.split('.')[1])).identifier, 10);
    } catch {
      return 0;
    }
  }
}
