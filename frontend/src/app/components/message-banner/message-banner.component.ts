import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-banner.component.html',
  styleUrls: ['./message-banner.component.css']
})
export class MessageBannerComponent {
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message = '';
  show = true;

  dismiss() {
    this.show = false;
  }

  get bgColor(): string {
    return {
      success: 'bg-green-100 text-green-800 border-green-300',
      error: 'bg-red-100 text-red-800 border-red-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      info: 'bg-blue-100 text-blue-800 border-blue-300',
    }[this.type] || 'bg-gray-100 text-gray-800 border-gray-300';
  }
}
