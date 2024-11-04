import { Component } from '@angular/core';
import { PromoBannerComponent } from "../../card_components/promo-banner/promo-banner.component";
import { PackagesComponent } from "../../card_components/packages/packages.component";
import { CategoriesComponent } from "../../card_components/categories/categories.component";

@Component({
  selector: 'app-home-section',
  standalone: true,
  imports: [PromoBannerComponent, PackagesComponent, CategoriesComponent],
  templateUrl: './home-section.component.html',
  styleUrl: './home-section.component.css'
})
export class HomeSectionComponent {

}
