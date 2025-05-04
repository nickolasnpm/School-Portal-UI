import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../user/services/auth/auth.service';
import { StorageService } from '../../../template/services/storage/storage.service';
import { AlertService } from '../../../template/services/alert/alert.service';

interface NavItem {
  label: string;
  link: string;
  icon?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  providers: [AuthService, StorageService, AlertService],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  moduleItems: NavItem[] = [
    { label: 'User', link: 'user/home' },
    { label: 'Attendance', link: '/attendance/dashboard' },
  ];

  managementItems: NavItem[] = [
    { label: 'User Profile', link: '/user/user-profile' },
    { label: 'User Management', link: '/user/user-management' },
    { label: 'Module Management', link: '/user/accessmodule-management' },
    { label: 'Role Management', link: '/user/role-management' },
    { label: 'Class Batch Management', link: '/user/batch-management' },
    { label: 'Class Ranking Management', link: '/user/rank-management' },
    { label: 'Class Stream Management', link: '/user/stream-management' },
    { label: 'Class Category Management', link: '/user/class-management' },
    { label: 'Subject Managment', link: '/user/subject-management' },
  ];

  isModulesOpen = false;
  isManagementOpen = false;
  isMobileMenuOpen = false;
  isMobileModulesExpanded = false;
  isMobileManagementExpanded = false;

  userId: string | undefined;

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _alertService: AlertService,
    private _storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.userId = this._authService.getUserId();
  }

  toggleModulesDropdown() {
    this.isModulesOpen = !this.isModulesOpen;
    this.isManagementOpen = false;
  }

  toggleManagementDropdown() {
    this.isManagementOpen = !this.isManagementOpen;
    this.isModulesOpen = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (!this.isMobileMenuOpen) {
      this.isMobileModulesExpanded = false;
      this.isMobileManagementExpanded = false;
    }
  }

  toggleMobileSection(section: 'modules' | 'management') {
    if (section === 'modules') {
      this.isMobileModulesExpanded = !this.isMobileModulesExpanded;
      this.isMobileManagementExpanded = false;
    } else if (section === 'management') {
      this.isMobileManagementExpanded = !this.isMobileManagementExpanded;
      this.isMobileModulesExpanded = false;
    }
  }

  @HostListener('window:click', ['$event'])
  onWindowClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Check if the clicked element is within the dropdown-related elements
    const isDropdownRelated = target.closest(
      'button.dropdown-button.management-button,' +
        'button.dropdown-button.modules-button,' +
        ' a.dropdown-item'
    );

    if (!isDropdownRelated) {
      this.isModulesOpen = false;
      this.isManagementOpen = false;
    }
  }

  logout() {
    if (this.userId) {
      this._authService.logoutUser(this.userId).subscribe({
        next: (res: any) => {
          if (res) {
            this._storageService.clearItems();
            this._router.navigate(['/user/login']);
          }
        },
        error: (err: { error: any }) => {
          console.error(err.error);
          this._alertService.displayAlert('Failed to logout');
        },
      });
    }
  }

  goToHome() {
    this._router.navigate(['/user/home']);
  }
}
