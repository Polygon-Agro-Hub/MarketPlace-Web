import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-otp-verify',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './otp-verify.component.html',
  styleUrl: './otp-verify.component.css'
})
export class OtpVerifyComponent implements OnInit, OnDestroy {
  otpControls: FormControl[] = [];
  isLoading = false;
  errorMessage = '';
  resendTimer = 0;
  private timerSubscription?: Subscription;
  private userData: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Create 5 form controls for OTP inputs
    for (let i = 0; i < 5; i++) {
      this.otpControls.push(new FormControl(''));
    }
  }

  ngOnInit() {
    this.authService.currentTempUser.subscribe(data => {
      if (!data) {
        this.router.navigate(['/signup']);
        return;
      }
      this.userData = data;
    });
    this.startResendTimer();
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }

  onOtpInput(event: any, index: number) {
    const input = event.target;
    let value = input.value;
    
    // Ensure only numbers are entered
    value = value.replace(/[^0-9]/g, '');
    this.otpControls[index].setValue(value);

    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = input.nextElementSibling;
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    // Handle backspace
    if (event.key === 'Backspace' && !value && index > 0) {
      const prevInput = input.previousElementSibling;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  startResendTimer() {
    this.resendTimer = 30;
    this.timerSubscription = interval(1000)
      .pipe(take(31))
      .subscribe(() => {
        if (this.resendTimer > 0) {
          this.resendTimer--;
        }
      });
  }

  async resendOTP() {
    if (this.resendTimer === 0) {
      try {
        await this.authService.sendOTP(this.userData.phone).toPromise();
        this.startResendTimer();
      } catch (error: any) {
        this.errorMessage = 'Failed to resend OTP';
      }
    }
  }

  async verifyOTP() {
    const enteredOTP = this.otpControls.map(control => control.value).join('');
    
    if (enteredOTP.length !== 5) {
      this.errorMessage = 'Please enter complete OTP';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.authService.verifyOTP(enteredOTP)) {
      try {
        // Send signup request to backend
        const response = await this.authService.signup(this.userData).toPromise();
        
        // Clear temporary data
        this.authService.clearTempData();
        
        // Navigate to home page
        this.router.navigate(['/']);
      } catch (error: any) {
        this.errorMessage = error.message || 'Signup failed';
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'Invalid OTP';
      this.isLoading = false;
    }
  }
}