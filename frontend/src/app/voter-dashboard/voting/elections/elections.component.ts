import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { ElectionService } from '../../../services/elections.service';
import { ElectionInterface } from '../../../interfaces/elections.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-elections',
  imports: [RouterModule, CommonModule],
  templateUrl: './elections.component.html',
  styleUrl: './elections.component.css'
})
export class ElectionsComponent implements OnInit {
  openElections: ElectionInterface[] = [];
  upcomingElections: ElectionInterface[] = [];
  loading = true;

  constructor(
    private electionService: ElectionService,
    private router: Router,
    private destroyRef: DestroyRef
  ) { }

  ngOnInit() {
    this.electionService.getAllElections()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          // res.data *is* your ElectionInterface[]
          const all = res.data;
          this.openElections = all.filter(e => e.status === 'open');
          this.upcomingElections = all.filter(e => e.status === 'upcoming');
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading elections', err);
          this.loading = false;
        }
      });
  }


  goToElection(electionId: number) {
    this.router.navigate([`/voter/voting/${electionId}/positions`]);
  }
}
