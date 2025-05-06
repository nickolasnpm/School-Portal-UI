import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  reInviteUser,
  userResponse,
  userUpdateRequest,
} from '../../../models/User';
import { roleResponse } from '../../../models/Role';
import { classCategoryResponse } from '../../../models/ClassCategory';
import { UserService } from '../../../services/user/user.service';
import { AlertService } from '../../../../template/services/alert/alert.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ClassSubjectService } from '../../../services/class-subject/class-subject.service';
import { classSubjectResponse } from '../../../models/ClassSubject';
import { SubjectCodeTransformPipe } from '../../../pipes/subject-code-transform.pipe';
import { AppConstants } from '../../../../template/helper/app-constants/app-constants';
import { RegisterService } from '../../../services/register/register.service';
import { ConvertStringToDate } from '../../../shared/convert-string-to-date/convert-string-to-date';

@Component({
  selector: 'app-view-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SubjectCodeTransformPipe],
  providers: [],
  templateUrl: './view-edit-user.component.html',
  styleUrl: './view-edit-user.component.css',
})
export class ViewEditUserComponent implements OnInit, OnChanges {
  @Input() isEdit: boolean = false;
  @Input() isAdmin: boolean = false;
  @Input() isfromUserProfile: boolean = false;

  @Input() users?: userResponse[] = [];
  @Input() user?: userResponse;
  @Input() availableRoles?: roleResponse[] = [];
  @Input() availableClasses?: classCategoryResponse[] = [];
  @Input() availableSubjects?: classSubjectResponse[] = [];

  @Output() popupForm = new EventEmitter<void>();
  @Output() userSaved = new EventEmitter<userResponse>();

  userForm!: FormGroup;
  studentForm!: FormGroup;
  teacherForm!: FormGroup;

  userData: userResponse | undefined;
  allClassSubjects: classSubjectResponse[] = [];
  selectedClassSubjectIds: string[] = [];

  isOwner: boolean = false;

  availableServiceStatus: string[] = AppConstants.SERVICE_STATUSES;
  availableResponsibilityType: string[] = AppConstants.RESPONSIBILITY_TYPES;

  constructor(
    private fb: FormBuilder,
    private _userService: UserService,
    private _alertService: AlertService,
    private _authService: AuthService,
    private _classSubjectService: ClassSubjectService,
    private _registerService: RegisterService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.initializeUserData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) {
      this.initializeUserData();
    }
  }

  private initializeForms() {
    // Main user form
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      serialTag: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      age: [''],
      isActive: [false],
      role: ['', Validators.required],
      classCategory: [''],
    });

    // Student specific form
    this.studentForm = this.fb.group({
      entranceYear: [null],
      estimatedExitYear: [null],
      realExitYear: [null],
      exitReason: [''],
    });

    // Teacher specific form
    this.teacherForm = this.fb.group({
      serviceStatus: [''],
      isAvailable: [false],
      responsibilityType: [''],
      responsibilityFocus: [''],
    });

    // Listen for role changes to update validation rules
    this.userForm.get('role')?.valueChanges.subscribe((role) => {
      this.updateValidationBasedOnRole(role);
    });
  }

  private updateValidationBasedOnRole(role: string) {
    if (role === 'Student') {
      this.userForm.get('classCategory')?.setValidators(Validators.required);
      this.teacherForm.clearValidators();

      this.studentForm.get('entranceYear')?.setValidators(Validators.required);
      this.studentForm
        .get('estimatedExitYear')
        ?.setValidators(Validators.required);
    } else if (role === 'Teacher') {
      this.userForm.get('classCategory')?.clearValidators();
      this.studentForm.clearValidators();

      this.teacherForm.get('serviceStatus')?.setValidators(Validators.required);
      this.teacherForm.get('isAvailable')?.setValidators(Validators.required);
    }
    // Update validity - uncomment this line
    this.userForm.get('classCategory')?.updateValueAndValidity();
    this.studentForm.updateValueAndValidity();
    this.teacherForm.updateValueAndValidity();
  }

  private initializeUserData() {
    if (this.user) {
      this.userData = { ...this.user };
      this.selectedClassSubjectIds = this.getSelectedClassSubjectIds(this.user);
      this.getAllClassSubjects(this.user);

      // Update form values
      this.userForm.patchValue({
        fullName: this.user.fullName,
        serialTag: this.user.serialTag,
        emailAddress: this.user.emailAddress,
        mobileNumber: this.user.mobileNumber,
        dateOfBirth: this.convertToHTMLDateFormat(this.user.dateOfBirth),
        gender: this.user.gender,
        age: this.user.age,
        isActive: this.user.isActive,
        role: this.user.roles[0],
      });

      // Set student form values if user is a student
      if (this.user.student && this.user.roles.includes('Student')) {
        this.userForm.patchValue({
          classCategory: this.getClassName(this.user.student.classCategoryId),
        });

        this.studentForm.patchValue({
          entranceYear: this.user.student.entranceYear ?? 0,
          estimatedExitYear: this.user.student.estimatedExitYear ?? 0,
          realExitYear: this.user.student.realExitYear ?? 0,
          exitReason: this.user.student.exitReason ?? 'N/A',
        });

        // Update validation for student role
        this.updateValidationBasedOnRole('Student');
      }

      // Set teacher form values if user is a teacher
      if (this.user.teacher && this.user.roles.includes('Teacher')) {
        if (this.user.teacher.classCategoryId) {
          this.userForm.patchValue({
            classCategory: this.getClassName(this.user.teacher.classCategoryId),
          });
        }

        this.teacherForm.patchValue({
          serviceStatus: this.user.teacher.serviceStatus,
          isAvailable: this.user.teacher.isAvailable,
          responsibilityType: this.user.teacher.responsibilityType,
          responsibilityFocus: this.user.teacher.responsibilityFocus,
        });
      }

      // Set control state (readonly/disabled) based on permissions
      this.updateFormControlState();
    }

    const userId = this._authService.getUserId();
    if (userId === this.user?.id) {
      this.isOwner = true;
      this.updateFormControlState();
    }
  }

  private updateFormControlState(): void {
    if (!this.isEdit) {
      this.disableForms();
      return;
    }

    if (this.isAdmin) {
      if (!this.isOwner && !this.isfromUserProfile) {
        this.configureAdminEdit();
      } else {
        this.configureOwnerProfileEdit();
      }
    } else {
      if (!this.isOwner && !this.isfromUserProfile) {
        this.configureOwnerProfileView();
      } else {
        this.configureOwnerProfileEdit();
      }
    }

    this.setAlwaysReadOnlyFields();
  }

  private disableForms(): void {
    this.userForm.disable();
    this.studentForm.disable();
    this.teacherForm.disable();
  }

  private configureOwnerProfileEdit(): void {
    this.userForm.enable();
    this.userForm.get('role')?.disable();
    this.userForm.get('classCategory')?.disable();
    this.studentForm.disable();
    this.teacherForm.disable();
  }

  private configureAdminEdit(): void {
    this.userForm.get('fullName')?.disable();
    this.userForm.get('mobileNumber')?.disable();
    this.userForm.get('dateOfBirth')?.disable();
    this.studentForm.enable();
    this.teacherForm.enable();
  }

  private configureOwnerProfileView(): void {
    this.userForm.get('role')?.disable();
    this.userForm.get('classCategory')?.disable();
    this.studentForm.disable();
    this.teacherForm.disable();
  }

  private setAlwaysReadOnlyFields(): void {
    const alwaysDisabledFields = [
      this.userForm.get('serialTag'),
      this.userForm.get('emailAddress'),
      this.userForm.get('gender'),
      this.userForm.get('age'),
      this.userForm.get('isActive'),
      this.teacherForm.get('responsibilityType'),
      this.teacherForm.get('responsibilityFocus'),
    ];

    alwaysDisabledFields.forEach((field) => field?.disable());
  }

  getAllClassSubjects(user: userResponse) {
    this._classSubjectService.getAll().subscribe({
      next: (cs) => {
        if (cs) {
          this.allClassSubjects = cs;

          if (user.roles.includes('Student') && user.student) {
            const className = this.getClassName(user.student.classCategoryId);
            if (className) {
              this.availableSubjects = this.allClassSubjects.filter((cs) =>
                cs.code.includes(className)
              );
            }
          } else if (user.roles.includes('Teacher') && user.teacher) {
            this.availableSubjects = this.allClassSubjects.filter(
              (cs) => cs.teachers?.some((ct) => ct.userId === user.id) ?? false
            );
          }

          this.sortSubjectsWithSelectedOnTop();
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to get all class subjects');
      },
    });
  }

  getClassName(classCategoryId: string): string | undefined {
    if (this.availableClasses) {
      const classCategory = this.availableClasses.find(
        (cc) => cc.id == classCategoryId
      );
      return classCategory?.code || 'N/A';
    }
    return undefined;
  }

  getClassId(classCategoryname: string): string | undefined {
    if (this.availableClasses) {
      if (classCategoryname) {
        const classCategory = this.availableClasses.find(
          (ccId) => ccId.code == classCategoryname
        );

        if (classCategory && classCategory.id) {
          return classCategory.id;
        }
      }
    }
    return undefined;
  }

  getSelectedClassSubjectIds(user: userResponse): string[] {
    if (user.student?.classSubjects) {
      return user.student.classSubjects.map((subject) => subject.id!);
    } else if (user.teacher?.classSubjects) {
      return user.teacher.classSubjects.map((subject) => subject.id!);
    }

    return [];
  }

  onSubjectChange(subjectId: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const isChecked = inputElement.checked;

    if (isChecked) {
      this.selectedClassSubjectIds.push(subjectId);
    } else {
      if (this.selectedClassSubjectIds.includes(subjectId)) {
        this.selectedClassSubjectIds = this.selectedClassSubjectIds.filter(
          (id) => id !== subjectId
        );
      }
    }
    this.sortSubjectsWithSelectedOnTop();
  }

  isSubjectSelected(subjectId: string): boolean {
    return this.selectedClassSubjectIds.includes(subjectId);
  }

  onAccountValidityChange(event: Event) {
    const isChecked = this.userForm.get('isActive')?.value;
    // Update underlying model if needed
    if (this.userData) {
      this.userData.isActive = isChecked;
    }
  }

  onDateChange(event: any) {
    const htmlDateValue = event.target.value;
    if (this.userData) {
      // Store the string representation for API compatibility
      this.userData.dateOfBirth = this.convertToApiDateFormat(htmlDateValue);
    }
  }

  onClassCategoryChange(event: any) {
    const classCategoryCode = event.target.value;

    if (this.userData?.roles.includes('Teacher')) {
      const teacher = this.checkIfClassBelongsToATeacher(classCategoryCode);

      if (teacher) {
        const confirmTakeOver = this.confirmClassTakeOver(
          teacher,
          classCategoryCode
        );

        if (confirmTakeOver) {
          this.selectedClassSubjectIds = [];

          this.availableSubjects = this.allClassSubjects.filter((cs) =>
            cs.code.includes(classCategoryCode)
          );
        }
      }
    } else {
      this.availableSubjects = this.allClassSubjects.filter((cs) =>
        cs.code.includes(classCategoryCode)
      );
    }
  }

  checkIfClassBelongsToATeacher(classCode: string): userResponse | undefined {
    if (this.availableClasses) {
      const classCategory = this.availableClasses.find(
        (ac) => ac.code === classCode
      );

      if (!classCategory) {
        return undefined;
      }

      const teachers = this.users!.filter((user) => user.teacher);
      return teachers.find(
        (t) => t.teacher?.classCategoryId === classCategory.id
      );
    }
    return undefined;
  }

  confirmClassTakeOver(
    toUpdateTeacher: userResponse,
    classCode: string
  ): boolean {
    const proceed = confirm(
      `Class ${classCode} is under the provision of Teacher ${toUpdateTeacher.fullName}. Do you still want to proceed?`
    );

    if (proceed) {
      toUpdateTeacher.teacher!.classCategoryId = undefined;

      const toUpdateUser: userUpdateRequest = {
        updateForRole: 'Teacher',
        id: toUpdateTeacher.id,
        fullName: toUpdateTeacher.fullName,
        emailAddress: toUpdateTeacher.emailAddress,
        mobileNumber: toUpdateTeacher.mobileNumber,
        dateOfBirth: ConvertStringToDate.stringToDate(
          toUpdateTeacher.dateOfBirth
        ),
        gender: toUpdateTeacher.gender,
        isActive: toUpdateTeacher.isActive,

        serviceStatus: toUpdateTeacher.teacher?.serviceStatus,
        isAvailable: toUpdateTeacher.teacher?.isAvailable,

        classCategoryId: toUpdateTeacher.teacher?.classCategoryId,
        classSubjectIds: toUpdateTeacher.teacher?.classSubjects?.map(
          (subject) => subject.id!
        ),
      };

      const updatedUser = this.updateUser(toUpdateUser);

      if (updatedUser) {
        this.userSaved.emit(updatedUser);
        return true;
      }
    }

    return false;
  }

  private sortSubjectsWithSelectedOnTop() {
    if (this.availableSubjects) {
      this.availableSubjects.sort((a, b) => {
        const aIsSelected = this.selectedClassSubjectIds.includes(a.id!);
        const bIsSelected = this.selectedClassSubjectIds.includes(b.id!);

        if (aIsSelected && !bIsSelected) return -1;
        if (!aIsSelected && bIsSelected) return 1;

        // If both are selected or both are not selected, maintain original order
        return a.code.localeCompare(b.code);
      });
    }
  }

  convertToHTMLDateFormat(dateString: string): string {
    if (!dateString) return '';

    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return '';
  }

  convertToApiDateFormat(dateString: string): string {
    if (!dateString) return '';

    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return '';
  }

  private getInvalidControls(form: FormGroup): string[] {
    const invalid = [];
    for (const control in form.controls) {
      if (form.controls[control].invalid) {
        invalid.push(control);
      }
    }
    return invalid;
  }

  save() {
    if (this.userForm.invalid) {
      const invalidControls = this.getInvalidControls(this.userForm);
      if (invalidControls.length > 0) {
        this._alertService.displayAlert(
          `Please fill in all required fields: ${invalidControls.join(', ')}`
 );;
      }
    }

    if (!this.userData) return;

    const userFormValues = this.userForm.getRawValue();
    const studentFormValues = this.studentForm.getRawValue();
    const teacherFormValues = this.teacherForm.getRawValue();

    const userData: userUpdateRequest = {
      updateForRole: this.user!.roles[0],
      id: this.userData.id,
      fullName: userFormValues.fullName,
      emailAddress: userFormValues.emailAddress,
      mobileNumber: userFormValues.mobileNumber,
      dateOfBirth: ConvertStringToDate.stringToDate(this.userData.dateOfBirth),
      gender: userFormValues.gender,
      isActive: userFormValues.isActive,

      // Teacher data
      serviceStatus: teacherFormValues.serviceStatus,
      isAvailable: teacherFormValues.isAvailable,
      responsibilityType: undefined,
      responsibilityFocus: undefined,

      // Student data
      entranceYear: studentFormValues.entranceYear,
      estimatedExitYear: studentFormValues.estimatedExitYear,
      realExitYear: studentFormValues.realExitYear,
      exitReason: studentFormValues.exitReason,

      classCategoryId: this.getClassId(userFormValues.classCategory),
      classSubjectIds: this.selectedClassSubjectIds,
    };

    // Validate classSubjectIds for students
    if (
      userData.updateForRole === 'Student' &&
      (!userData.classCategoryId || this.selectedClassSubjectIds.length === 0)
    ) {
      if (!userData.classCategoryId) {
        this._alertService.displayAlert(
          'Class Category is required for Students'
        );
      } else {
        this._alertService.displayAlert(
          'At least one Class Subject must be selected for Students'
        );
      }
      return;
    }

    const updatedUser = this.updateUser(userData);

    if (updatedUser) {
      this.userSaved.emit(updatedUser);
    }

    this.close();
  }

  updateUser(userData: userUpdateRequest): userResponse | undefined {
    this._userService.updateUser(userData.id, userData).subscribe({
      next: (response: userResponse) => {
        if (response) {
          this._alertService.displayAlert('User updated successfully');
          return response;
        }
        return undefined;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this._alertService.displayAlert('Failed to update user');
      },
    });
    return undefined;
  }

  deleteUser(user: userResponse) {
    const proceed = confirm(
      `Are you sure you want to delete this user - ${user.fullName}? - permanently`
    );

    if (proceed) {
      this._userService.deleteUser(user.id).subscribe({
        next: (response: boolean) => {
          if (response) {
            this._alertService.displayAlert('User updated successfully');
            this.close();
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this._alertService.displayAlert('Failed to update user');
        },
      });
    }
  }

  reInviteUser(user: userResponse) {
    if (user && user.emailAddress) {
      const reinviteUser: reInviteUser = {
        emailAddress: user.emailAddress,
      };

      this._registerService.reInviteUser(reinviteUser).subscribe({
        next: (response: boolean) => {
          if (response) {
            this._alertService.displayAlert(
              'Re-invitation to login has been sent to user email address.'
            );
            this.close();
          } else {
            this._alertService.displayAlert('Failed to reinvite user');
          }
        },
        error: (error) => {
          console.error('Error reinviting user:', error);
          this._alertService.displayAlert('Failed to reinvite user');
        },
      });
    }
  }

  close() {
    this.popupForm.emit();
  }
}
