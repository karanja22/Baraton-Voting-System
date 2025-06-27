import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VoterSidebarComponent } from '../../components/voter-sidebar/voter-sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-voter-dashboard',
  imports: [RouterOutlet, VoterSidebarComponent, CommonModule],
  templateUrl: './voter-dashboard.component.html',
  styleUrl: './voter-dashboard.component.css'
})
export class VoterDashboardComponent {
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
}
