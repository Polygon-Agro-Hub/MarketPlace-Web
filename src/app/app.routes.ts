import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './application/main_components/login/login.component';
import { SignupComponent } from './application/main_components/signup/signup.component';
import { DashboardComponent } from './application/main_components/dashboard/dashboard.component';
import { OtpVerifyComponent } from './application/main_components/otp-verify/otp-verify.component';
import { CategoriesComponent } from './application/card_components/categories/categories.component';
import { HomeSectionComponent } from './application/main_components/home-section/home-section.component';
import { CategorySectionComponent } from './application/main_components/category-section/category-section.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [

    { path: '', component: DashboardComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'verify-otp', component: OtpVerifyComponent },
    { path: 'category', component: CategoriesComponent },
    { path: 'home', component: HomeSectionComponent },
  { path: 'category', component: CategorySectionComponent },
   

];

