import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']  // <-- Corrected to styleUrls
})
export class LoginComponent {
  disError: any;
  loginObj: Login;

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {
    this.loginObj = new Login();
  }

  ngOnInit(): void {
    
 
  }

  onSubmit(): void {
    

      console.log('Login:', this.loginObj.email, this.loginObj.password);

      this.authService.login(this.loginObj.email, this.loginObj.password).subscribe(
        (res: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Logged',
            text: 'Successfully Logged In',
            showConfirmButton: false,
            timer: 1500
          });
          localStorage.setItem('Token:', res.token);
          localStorage.setItem('userId:', res.userId);
          //   localStorage.setItem('Token Expiration', String(new Date().getTime() + (res.expiresIn * 20)));
          this.router.navigate(['/home']);
        },
        (error) => {
          console.error('Error updating Market Price', error);
          this.disError = error.error?.error || 'An error occurred. Please try again.';
          Swal.fire({
            icon: 'error',
            title: 'Unsuccessful',
            text: this.disError,
          });
        }
      );
    }
  }


export class Login{
  email: string;
  password: string;
  
  constructor(){
    this.email='';
    this.password='';
  }


}
