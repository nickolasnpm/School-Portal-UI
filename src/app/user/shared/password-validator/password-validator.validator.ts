import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidator {
  static followStrengthFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSymbol = /[!@#$%^&*,._]/.test(value);

      return hasUppercase && hasLowercase && hasNumber && hasSymbol
        ? null
        : { passwordStrength: true }; // General error
    };
  }

  static mustBeDifferent(
    oldPasswordControl: string,
    newPasswordControl: string
  ): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const oldPassword = formGroup.get(oldPasswordControl);
      const newPassword = formGroup.get(newPasswordControl);

      if (!oldPassword || !newPassword) {
        return null;
      }

      if (newPassword.errors && !newPassword.errors['passwordSimilar']) {
        return null;
      }

      if (
        oldPassword.value &&
        newPassword.value &&
        oldPassword.value === newPassword.value
      ) {
        newPassword.setErrors({ passwordSimilar: true });
        return { passwordSimilar: true };
      } else {
        newPassword.setErrors(null);
        return null;
      }
    };
  }

  static mustBeSimilar(
    newPasswordControl: string,
    confirmPasswordControl: string
  ): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const newPassword = formGroup.get(newPasswordControl);
      const confirmPassword = formGroup.get(confirmPasswordControl);

      if (!newPassword || !confirmPassword) {
        return null;
      }

      if (
        confirmPassword.errors &&
        !confirmPassword.errors['passwordMismatch']
      ) {
        return null;
      }

      if (newPassword.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        confirmPassword.setErrors(null);
        return null;
      }
    };
  }
}
