import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  userData = {
    title: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      // Store user data temporarily
      this.authService.setTempUserData(this.userData);
      
      // Send OTP
      await this.authService.sendOTP(this.userData.phoneNumber).toPromise();
      
      // Navigate to OTP verification
      this.router.navigate(['/verify-otp']);
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred during signup';
      this.isLoading = false;
    }
  }
}