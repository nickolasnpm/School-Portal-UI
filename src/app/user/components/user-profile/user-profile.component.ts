import { Component, OnDestroy, OnInit } from '@angular/core';
import { userResponse } from '../../models/User';
import { roleResponse } from '../../models/Role';
import { classCategoryResponse } from '../../models/ClassCategory';
import { classSubjectResponse } from '../../models/ClassSubject';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../template/services/alert/alert.service';
import { StorageService } from '../../../template/services/storage/storage.service';
import { UserStatusService } from '../../../template/services/user-status/user-status.service';
import { Router } from '@angular/router';
import { KeyConstant } from '../../../template/helper/local-storage/key-constant';
import { ViewEditUserComponent } from '../user-management/view-edit/view-edit-user.component';
import { UserService } from '../../services/user/user.service';
import { Subject, takeUntil } from 'rxjs';
import { RoleService } from '../../services/role/role.service';
import { ClassCategoryService } from '../../services/class-category/class-category.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewEditUserComponent],
  providers: [AlertService, StorageService, UserStatusService],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit, OnDestroy {
  user: userResponse | undefined;

  isEditMode = false;
  isAdmin = false;
  isfromUserProfile = false;

  showViewEditPopup = false;

  availableRoles: roleResponse[] = [];
  availableClasses: classCategoryResponse[] = [];
  availableSubjects: classSubjectResponse[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private _router: Router,
    private _storageService: StorageService,
    private _alertService: AlertService,
    private _userService: UserService,
    private _roleService: RoleService,
    private _classCategoryService: ClassCategoryService
  ) {}

  ngOnInit(): void {
    this.getUserDetails();
    this.loadRoles();
    this.loadClassCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserDetails() {
    const jsonResult = this._storageService.getItem(KeyConstant.USER_RESPONSE);

    let userId = '';

    if (jsonResult) {
      const parsedUser = JSON.parse(jsonResult);
      userId = parsedUser.id;
    }

    this._userService
      .getUserById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: userResponse) => {
          if (!result) {
            this._alertService.displayAlert('Failed to load user details');
            return;
          }

          this.user = result;
          const jsonResponse = JSON.stringify(result);
          this._storageService.setItem(KeyConstant.USER_RESPONSE, jsonResponse);

          if (this.user.roles.includes('Admin')) {
            this.isAdmin = true;
          }
        },
        error: (err) => {
          console.error(err.error);
          this._alertService.displayAlert('Failed to load user details');
        },
      });
  }

  getStatusClass(status: boolean): string {
    return status ? 'badge-success' : 'badge-danger';
  }

  loadRoles() {
    this._roleService.getAll().subscribe({
      next: (res) => {
        if (res) {
          this.availableRoles = res.sort((a, b) =>
            a.title.localeCompare(b.title)
          );
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to get all roles');
      },
    });
  }

  loadClassCategories() {
    this._classCategoryService.getAll().subscribe({
      next: (res) => {
        if (res) {
          this.availableClasses = res.sort((a, b) =>
            a.code.localeCompare(b.code)
          );
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to get all class categories');
      },
    });
  }

  editUser(user: userResponse) {
    console.log('Edit user:', user);

    this.isEditMode = true;
    this.isfromUserProfile = true;
    this.showViewEditPopup = true;
  }

  handleUserSaved(user: userResponse) {
    this.getUserDetails();
    this.showViewEditPopup = false;
  }

  closePopupForm() {
    this.showViewEditPopup = false;
  }

  backToHome() {
    this._router.navigate(['/user/home']);
  }
}
