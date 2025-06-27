import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ElectionInterface } from '../../../interfaces/elections.interface';
import { PositionInterface } from '../../../interfaces/position.interface';
import { ElectionService } from '../../../services/elections.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-positions',
  imports: [RouterModule, CommonModule],
  templateUrl: './positions.component.html',
  styleUrl: './positions.component.css'
})
export class PositionsComponent implements OnInit {
  // — Injected services & destroy reference —
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private electionService = inject(ElectionService);

  // — Component state —
  electionId!: number;
  positions: PositionInterface[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    // Read the election ID from the URL
    this.electionId = Number(this.route.snapshot.paramMap.get('electionId'));

    // Fetch the election (including positions)
    this.electionService.getElectionById(this.electionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const election: ElectionInterface = res.data;

          // If no positions, treat as unstructured and skip to candidates
          if (!election.has_positions || !election.positions.length) {
            this.router.navigate([`/voter/voting/${this.electionId}/positions/none/candidates`]);
          } else {
            this.positions = election.positions;
          }

          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load election positions', err);
          this.error = 'Could not load positions.';
          this.loading = false;
        }
      });
  }

  goToCandidates(positionId: number) {
    // Navigate to the candidates list for the chosen position
    this.router.navigate([`/voter/voting/${this.electionId}/positions/${positionId}/candidates`]);
  }
  goBack() {
    this.router.navigate([`/voter/voting`]);
  }

}