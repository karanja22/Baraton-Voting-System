import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ElectrolCommisionSidebarComponent } from '../../components/electrol-commision-sidebar/electrol-commision-sidebar.component';

@Component({
  selector: 'app-electrol-commision-dashboard',
  imports: [RouterOutlet, ElectrolCommisionSidebarComponent],
  templateUrl: './electrol-commision-dashboard.component.html',
  styleUrl: './electrol-commision-dashboard.component.css'
})
export class ElectrolCommisionDashboardComponent {

}
