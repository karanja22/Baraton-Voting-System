import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-voter-sidebar',
  imports: [RouterLink],
  templateUrl: './voter-sidebar.component.html',
  styleUrl: './voter-sidebar.component.css'
})
export class VoterSidebarComponent {
  constructor(private router: Router) { }

  onLogout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
