import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './template/components/header/header.component';
import { FooterComponent } from './template/components/footer/footer.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    HttpClientModule,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'school-portal-ui';

  showHeaderFooter: boolean = true;

  constructor(private router: Router) {
    // Subscribe to router events to check current route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Array of routes where header/footer should be hidden
        const authRoutes = [
          '/user/login',
          '/user/reset-password',
          '/user/verify-account',
        ];
        // Hide header and footer on specified routes
        this.showHeaderFooter = !authRoutes.some((route) =>
          event.url.includes(route)
        );
      });
  }
}
