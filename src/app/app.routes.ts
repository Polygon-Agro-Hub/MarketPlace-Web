import { Routes } from '@angular/router';
import { LoginComponent } from './application/main_components/login/login.component';
import { SignupComponent } from './application/main_components/signup/signup.component';
import { DashboardComponent } from './application/main_components/dashboard/dashboard.component';
import { OtpVerifyComponent } from './application/main_components/otp-verify/otp-verify.component';

export const routes: Routes = [

    { path: '', component: DashboardComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'verify-otp', component: OtpVerifyComponent },
   

];
