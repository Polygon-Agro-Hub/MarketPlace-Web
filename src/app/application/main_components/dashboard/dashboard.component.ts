import { Component } from '@angular/core';
import { HeaderComponent } from "../../common_components/header/header.component";
import { NavbarComponent } from "../../common_components/navbar/navbar.component";
import { PromoBannerComponent } from "../../card_components/promo-banner/promo-banner.component";
import { PackagesComponent } from "../../card_components/packages/packages.component";
import { CategoriesComponent } from "../../card_components/categories/categories.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, NavbarComponent, PromoBannerComponent, PackagesComponent, CategoriesComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
