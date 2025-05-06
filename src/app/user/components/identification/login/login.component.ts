import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

import { PasswordValidator } from '../../../shared/password-validator/password-validator.validator';
import { AuthService } from '../../../services/auth/auth.service';
import { loginRequest, loginResponse, userResponse } from '../../../models/User';
import { StorageService } from '../../../../template/services/storage/storage.service';
import { KeyConstant } from '../../../../template/helper/local-storage/key-constant';
import { AlertService } from '../../../../template/services/alert/alert.service';
import { UserService } from '../../../services/user/user.service';
import { UserStatusService } from '../../../../template/services/user-status/user-status.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  providers: [AuthService, StorageService, AlertService, UserService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginform!: FormGroup;
  showPassword: boolean = false;
  loginAttempts: number = 0;
  isFormLocked: boolean = false;
  private readonly maxLoginAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
  private lockoutTimer: any;
  private destroy$ = new Subject<void>();

  constructor(
    private _router: Router,
    private fb: FormBuilder,
    private _authService: AuthService,
    private _storageService: StorageService,
    private _alertService: AlertService,
    private _userService: UserService,
    private _registerStatusService: UserStatusService
  ) {
    this.initializeForm();
    this.checkPreviousLockout();
  }

  ngOnInit(): void {
    this._registerStatusService.userConfiguration();
  }

  private checkPreviousLockout(): void {
    const lockoutTime = this._storageService.getItem(KeyConstant.LOGIN_LOCKOUT);
    if (lockoutTime) {
      const remainingTime = parseInt(lockoutTime) - Date.now();
      if (remainingTime > 0) {
        this.isFormLocked = true;
        this.setLockoutTimer(remainingTime);
      } else {
        this._storageService.removeItem(KeyConstant.LOGIN_LOCKOUT);
      }
    }
  }

  private initializeForm(): void {
    this.loginform = this.fb.group({
      emailAddress: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16),
          PasswordValidator.followStrengthFormat(),
        ],
      ],
    });

    // Subscribe to form changes to reset validation messages
    this.loginform.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.loginform.get('emailAddress')?.touched) {
        this.validateEmail();
      }
      if (this.loginform.get('password')?.touched) {
        this.validatePassword();
      }
    });
  }

  private validateEmail(): string[] {
    const errors: string[] = [];
    const email = this.loginform.get('emailAddress');

    if (email?.errors) {
      if (email.errors['required']) {
        errors.push('Email is required');
      }
      if (email.errors['email']) {
        errors.push('Please enter a valid email address');
      }
      if (email.errors['maxlength']) {
        errors.push('Email cannot exceed 100 characters');
      }
    }

    return errors;
  }

  private validatePassword(): string[] {
    const errors: string[] = [];
    const password = this.loginform.get('password');

    if (password?.errors) {
      if (password.errors['required']) {
        errors.push('Password is required');
      }
      if (password.errors['minlength']) {
        errors.push('Password must be at least 8 characters');
      }
      if (password.errors['maxlength']) {
        errors.push('Password cannot exceed 16 characters');
      }
      if (password.errors['strengthError']) {
        errors.push(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        );
      }
    }

    return errors;
  }

  private handleLoginSuccess(response: loginResponse): void {
    if (!response || !response.id) {
      this._alertService.displayAlert('Invalid login response');
      return;
    }

    this.loginAttempts = 0;
    this._storageService.removeItem(KeyConstant.LOGIN_ATTEMPTS);

    const jsonResponse = JSON.stringify(response);
    this._storageService.setItem(KeyConstant.AUTH_TOKEN, jsonResponse);

    this.getUserDetails(response.id);
  }

  private handleLoginError(): void {
    this.loginAttempts++;
    this._storageService.setItem(
      KeyConstant.LOGIN_ATTEMPTS,
      this.loginAttempts.toString()
    );

    if (this.loginAttempts >= this.maxLoginAttempts) {
      this.lockAccount();
      return;
    }

    const remainingAttempts = this.maxLoginAttempts - this.loginAttempts;
    this._alertService.displayAlert(
      `Login failed. ${remainingAttempts} attempts remaining before account lockout.`
    );
  }

  private lockAccount(): void {
    this.isFormLocked = true;
    const lockoutEndTime = Date.now() + this.lockoutDuration;
    this._storageService.setItem(
      KeyConstant.LOGIN_LOCKOUT,
      lockoutEndTime.toString()
    );
    this.setLockoutTimer(this.lockoutDuration);
    this._alertService.displayAlert(
      'Too many failed login attempts. Please try again in 15 minutes.'
    );
  }

  private setLockoutTimer(duration: number): void {
    if (this.lockoutTimer) {
      clearTimeout(this.lockoutTimer);
    }

    this.lockoutTimer = setTimeout(() => {
      this.isFormLocked = false;
      this.loginAttempts = 0;
      this._storageService.removeItem(KeyConstant.LOGIN_LOCKOUT);
      this._storageService.removeItem(KeyConstant.LOGIN_ATTEMPTS);
    }, duration);
  }

  login(): void {
    if (this.isFormLocked) {
      this._alertService.displayAlert(
        'Account is temporarily locked. Please try again later.'
      );
      return;
    }

    if (this.loginform.valid) {
      const { emailAddress, password } = this.loginform.value;

      const loginRequest: loginRequest = {
        emailAddress: emailAddress.trim().toLowerCase(),
        password: password,
      };

      this._authService
        .loginUser(loginRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: loginResponse) => {
            if (result) {
              this.handleLoginSuccess(result);
            }
          },
          error: (err) => {
            console.error(err.error);
            this._alertService.displayAlert('Failed login user.');
            this.handleLoginError();
          },
        });
    } else {
      this.loginform.markAllAsTouched();
      this._alertService.displayAlert(
        'Please correct the form errors before submitting.'
      );
    }
  }

  private getUserDetails(userId: string): void {
    this._userService
      .getUserById(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: userResponse) => {
          if (!result) {
            this._alertService.displayAlert('Failed to load user details');
            return;
          }

          const jsonResponse = JSON.stringify(result);
          this._storageService.setItem(KeyConstant.USER_RESPONSE, jsonResponse);

          // Determine redirect path based on user status
          if (!result.isActive) {
            this._alertService.displayAlert(
              'User is not active. Please contact your administrator.'
            );
          } else if (!result.isConfirmedEmail) {
            this._router.navigate(['/user/verify-account']);
          } else if (!result.isChangedPassword) {
            this._router.navigate(['/user/change-password']);
          } else {
            this._router.navigate(['/user/home']);
          }
        },
        error: (err) => {
          console.error(err.error);
          this._alertService.displayAlert('Failed to load user details');
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  resetPassword(): void {
    this._router.navigate(['/user/reset-password']);
  }

  ngOnDestroy(): void {
    if (this.lockoutTimer) {
      clearTimeout(this.lockoutTimer);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  get emailControl(): AbstractControl | null {
    return this.loginform.get('emailAddress');
  }

  get passwordControl(): AbstractControl | null {
    return this.loginform.get('password');
  }
}
