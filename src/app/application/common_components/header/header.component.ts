import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  token: any | null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) {}


  ngOnInit() {
    // Check if running in the browser before accessing localStorage
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('Token:');
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Remove the login token from localStorage
      localStorage.removeItem('Token:');
  
      // Show a logout confirmation
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been successfully logged out.',
      }).then(() => {
        // Redirect to the login page after confirmation
        this.router.navigateByUrl('');
      });
    }
  }
}
