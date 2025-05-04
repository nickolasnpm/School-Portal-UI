import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { userResponse, userVerifyAccount } from '../../models/User';
import { UserService } from '../../services/user/user.service';
import { AlertService } from '../../../template/services/alert/alert.service';
import { StorageService } from '../../../template/services/storage/storage.service';
import { KeyConstant } from '../../../template/helper/local-storage/key-constant';
import { UserStatusService } from '../../../template/services/user-status/user-status.service';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [
    UserService,
    AlertService,
    StorageService,
    UserStatusService,
  ],
  templateUrl: './verify-account.component.html',
  styleUrls: ['./verify-account.component.css'],
})
export class VerifyAccountComponent {
  verifyForm!: FormGroup;

  constructor(
    private _router: Router,
    private fb: FormBuilder,
    private _userService: UserService,
    private _alertService: AlertService,
    private _storageService: StorageService,
    private _registerStatusService: UserStatusService
  ) {}

  ngOnInit(): void {
    this._registerStatusService.userConfiguration();
    this.initializeForm();
  }

  initializeForm() {
    this.verifyForm = this.fb.group({
      emailAddress: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      verificationNumber: [
        '',
        [Validators.required, Validators.pattern('^.{6,6}$')],
      ],
    });
  }

  verifyAccount() {
    if (this.verifyForm.valid) {
      const formValues = this.verifyForm.value;
      const userVerifyAccount: userVerifyAccount = {
        emailAddress: formValues.emailAddress,
        mobileNumber: formValues.mobileNumber,
        verificationNumber: formValues.verificationNumber,
      };

      this._userService.verifyAccount(userVerifyAccount).subscribe({
        next: (result: userResponse) => {
          if (result && result.isConfirmedEmail) {
            this._alertService.displayAlert('Account verified successfully');

            this.getUpdatedUserDetails(result);
          } else {
            this._alertService.displayAlert('Failed to load user details');
          }
        },
        error: (err) => {
          console.error(err.error);
          this._alertService.displayAlert('Failed to verify account');
        },
      });
    }
  }

  getUpdatedUserDetails(result: userResponse) {
    const jsonResponse = JSON.stringify(result);
    this._storageService.setItem(KeyConstant.USER_RESPONSE, jsonResponse);
    this._router.navigate(['/user/home']);
  }

  backToLogin() {
    this._storageService.clearItems();
    this._router.navigate(['/user/login']);
  }
}
