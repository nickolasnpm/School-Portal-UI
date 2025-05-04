import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { KeyConstant } from '../../helper/local-storage/key-constant';
import { userResponse } from '../../../user/models/User';
import { Router } from '@angular/router';
import { AuthService } from '../../../user/services/auth/auth.service';
import { AlertService } from '../alert/alert.service';
import { UserService } from '../../../user/services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class UserStatusService {
  constructor(
    private readonly _router: Router,
    private readonly _authService: AuthService,
    private readonly _storageService: StorageService,
    private readonly _alertService: AlertService,
    private readonly _userService: UserService
  ) {}

  userConfiguration(): void {
    const currentUrl = this._router.url;
    if (currentUrl === '/user/login') {
      return;
    }

    const userId = this._authService.getUserId();

    if (userId) {
      this.handleRegistrationStatus(userId);
    } else {
      this._storageService.clearItems();
      this._router.navigate(['/user/login']);
    }
  }

  private handleRegistrationStatus(tokenId: string): void {
    this._userService.getUserById(tokenId).subscribe({
      next: (res: userResponse) => {
        if (res) {
          if (!res.isActive) {
            this._alertService.displayAlert(
              'User is not active. Please contact your administrator.'
            );
            this._storageService.clearItems();
            this._router.navigate(['/user/login']);
          } else if (!res.isConfirmedEmail) {
            this._alertService.displayAlert(
              'Please verify your email address.'
            );
            this._router.navigate(['/user/verify-account']);
          } else if (!res.isChangedPassword) {
            this._alertService.displayAlert(
              'Please change your password for better security.'
            );
            this._router.navigate(['/user/change-password']);
          } else {
            this._storageService.setItem(
              KeyConstant.USER_RESPONSE,
              JSON.stringify(res)
            );
            this._router.navigate(['/user/home']);
          }
        }
      },
      error: (error) => {
        console.error('GetUserById error:', error);
        this._alertService.displayAlert(
          'Failed to load user details. Please try again.'
        );
        this._storageService.clearItems();
        this._router.navigate(['/user/login']);
      },
    });
  }
}
