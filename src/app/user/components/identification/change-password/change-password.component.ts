import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PasswordValidator } from '../../../shared/password-validator/password-validator.validator';
import { UserStatusService } from '../../../../template/services/user-status/user-status.service';
import { AlertService } from '../../../../template/services/alert/alert.service';
import { UserService } from '../../../services/user/user.service';
import { userChangePassword, userResponse } from '../../../models/User';
import { StorageService } from '../../../../template/services/storage/storage.service';
import { KeyConstant } from '../../../../template/helper/local-storage/key-constant';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [
    UserStatusService,
    AlertService,
    StorageService,
    UserService,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  changePasswordForm!: FormGroup;
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private _router: Router,
    private fb: FormBuilder,
    private _alertService: AlertService,
    private _storageService: StorageService,
    private _userService: UserService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.changePasswordForm = this.fb.group(
      {
        emailAddress: ['', [Validators.required, Validators.email]],
        oldPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(16),
            PasswordValidator.followStrengthFormat(),
          ],
        ],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(16),
            PasswordValidator.followStrengthFormat(),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: [
          PasswordValidator.mustBeDifferent('oldPassword', 'newPassword'),
          PasswordValidator.mustBeSimilar('newPassword', 'confirmPassword'),
        ],
      }
    );
  }

  changePassword() {
    if (this.changePasswordForm.valid) {
      const formValues = this.changePasswordForm.value;

      const userChangePassword: userChangePassword = {
        emailAddress: formValues.emailAddress,
        oldPassword: formValues.oldPassword,
        newPassword: formValues.newPassword,
        confirmNewPassword: formValues.confirmPassword,
      };

      this._userService.changePassword(userChangePassword).subscribe({
        next: (result: userResponse) => {
          if (result && result.isChangedPassword) {
            this._alertService.displayAlert('Password changed successfully.');

            this.getUpdatedUserDetails(result);
          } else {
            this._alertService.displayAlert('Failed to change password');
          }
        },
        error: (err) => {
          console.error(err.error);
          this._alertService.displayAlert('Failed to change password.');
        },
      });
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }

  getUpdatedUserDetails(result: userResponse) {
    const jsonResponse = JSON.stringify(result);
    this._storageService.setItem(KeyConstant.USER_RESPONSE, jsonResponse);
    this._router.navigate(['/user/home']);
  }

  toggleOldPasswordVisibility() {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToHome() {
    this._router.navigate(['/user/home']);
  }
}
