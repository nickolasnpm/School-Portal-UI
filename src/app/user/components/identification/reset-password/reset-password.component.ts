import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { userResetPasssword } from '../../../models/User';
import { UserService } from '../../../services/user/user.service';
import { AlertService } from '../../../../template/services/alert/alert.service';
import { StorageService } from '../../../../template/services/storage/storage.service';
import { KeyConstant } from '../../../../template/helper/local-storage/key-constant';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [AlertService, StorageService, UserService],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  resetPasswordForm!: FormGroup;

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
    this.resetPasswordForm = this.fb.group({
      emailAddress: ['', [Validators.required, Validators.email]],
    });
  }

  resetPassword() {
    if (this.resetPasswordForm.valid) {
      const formValues = this.resetPasswordForm.value;

      const resetPassword: userResetPasssword = {
        emailAddress: formValues.emailAddress,
      };

      this._userService.resetPassword(resetPassword).subscribe({
        next: (res) => {
          if (res) {
            this._alertService.displayAlert(
              'Password reset successfully. Please check your email for temporary password'
            );

            this.backToLogin();
          }
        },
        error: (err) => {
          console.error(err.error);
          this._alertService.displayAlert('Failed to reset password');
        },
      });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }

  backToLogin() {
    this._storageService.clearItems();
    this._router.navigate(['/user/login']);
  }
}
