import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HomeSectionComponent } from "../../main_components/home-section/home-section.component";
import { CategorySectionComponent } from "../../main_components/category-section/category-section.component";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, HomeSectionComponent, CategorySectionComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  token: any | null;
  selectedPath: 'home' | 'category' = 'home';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Check if running in the browser before accessing localStorage
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('Token:');
    }
  }


  selectPath(path: 'home' | 'category' ) {
    this.selectedPath = path;
  }
}
