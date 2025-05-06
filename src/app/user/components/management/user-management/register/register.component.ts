import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { userAddRequest } from '../../../../models/User';
import { roleResponse } from '../../../../models/Role';
import { CommonModule } from '@angular/common';
import { batchResponse } from '../../../../models/Batch';
import { subjectResponse } from '../../../../models/Subject';
import { classCategoryResponse } from '../../../../models/ClassCategory';
import { classSubjectResponse } from '../../../../models/ClassSubject';
import { AppConstants } from '../../../../../template/helper/app-constants/app-constants';
import { GetYears } from '../../../../shared/get-years/get-years';
import { RoleService } from '../../../../services/role/role.service';
import { HttpClientModule } from '@angular/common/http';
import { BatchService } from '../../../../services/batch/batch.service';
import { ClassCategoryService } from '../../../../services/class-category/class-category.service';
import { ClassSubjectService } from '../../../../services/class-subject/class-subject.service';
import { SubjectCodeTransformPipe } from '../../../../pipes/subject-code-transform.pipe';
import { SubjectService } from '../../../../services/subject/subject.service';
import { RegisterService } from '../../../../services/register/register.service';
import { AlertService } from '../../../../../template/services/alert/alert.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    SubjectCodeTransformPipe,
  ],
  providers: [
    RoleService,
    BatchService,
    ClassCategoryService,
    ClassSubjectService,
    SubjectService,
    RegisterService,
    AlertService,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  @Output() popupForm = new EventEmitter<void>();

  registrationForm!: FormGroup;

  startYears: number[] = GetYears.getYears();
  endYears: number[] = [];
  genders: string[] = AppConstants.GENDERS;
  serviceStatuses = AppConstants.SERVICE_STATUSES;

  allRoles: roleResponse[] = [];
  selectedRole: string = '';

  allBatches: batchResponse[] = [];

  allClassCategories: classCategoryResponse[] = [];
  classCategories: classCategoryResponse[] = this.allClassCategories;

  allSubjects: subjectResponse[] = [];

  allClassSubjects: classSubjectResponse[] = [];
  classSubjects: classSubjectResponse[] = [];
  checkedClassSubjects: classSubjectResponse[] = [];
  selectedClassSubjectIds: string[] = [];
  isDisplayClassSubjectsForTeacher: boolean = false;

  teacherVariable: string = 'teacher';
  studentVariable: string = 'student';

  constructor(
    private _fb: FormBuilder,
    private _roleService: RoleService,
    private _batchService: BatchService,
    private _classCategoryService: ClassCategoryService,
    private _classSubjectService: ClassSubjectService,
    private _subjectService: SubjectService,
    private _registerService: RegisterService,
    private _alertService: AlertService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeServices();
    this.updateForms();
  }

  initializeServices(): void {
    // role services
    this._roleService.getAll().subscribe({
      next: (res) => {
        if (res) {
          this.allRoles = res.sort((a: roleResponse, b: roleResponse) => {
            return a.title.localeCompare(b.title);
          });
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to get all roles');
      },
    });

    // batch services
    this._batchService.getAll(true).subscribe({
      next: (res) => {
        if (res) {
          this.allBatches = res.sort((a: batchResponse, b: batchResponse) => {
            return a.code.localeCompare(b.code);
          });
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to get all batches');
      },
    });

    // class category services
    this._classCategoryService.getAll().subscribe({
      next: (res) => {
        if (res) {
          this.allClassCategories = res.sort(
            (a: classCategoryResponse, b: classCategoryResponse) => {
              return a.code.localeCompare(b.code);
            }
          );
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to get all class categories');
      },
    });

    // class subjects services
    this._classSubjectService.getAll().subscribe({
      next: (res) => {
        if (res) {
          this.allClassSubjects = res.sort(
            (a: classSubjectResponse, b: classSubjectResponse) => {
              return a.code.localeCompare(b.code);
            }
          );
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to get all class subjects');
      },
    });

    // subject services
    this._subjectService.getAll().subscribe({
      next: (res) => {
        if (res) {
          this.allSubjects = res.sort(
            (a: subjectResponse, b: subjectResponse) => {
              return a.name.localeCompare(b.name);
            }
          );
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to get all subjects');
      },
    });
  }

  initializeForm() {
    this.registrationForm = this._fb.group({
      registerForRole: ['', Validators.required],
      fullName: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      // Teacher properties
      serviceStatus: [''],
      isAvailable: [false],
      // Student properties
      entranceYear: [null],
      estimatedExitYear: [null],
      // Common properties
      batchId: [''],
      classCategoryId: [''],
      subjectId: [''],
      classSubjectIds: [[]],
    });
  }

  updateForms() {
    this.registrationForm
      .get('registerForRole')
      ?.valueChanges.subscribe((r) => {
        this.updateValidators(r.toLowerCase());
        this.updateClassSubjectsSelections(null, null);
      });

    this.registrationForm
      .get('entranceYear')
      ?.valueChanges.subscribe((year: number) => {
        this.endYears = this.startYears.filter((y) => y > year);
      });

    this.registrationForm.get('batchId')?.valueChanges.subscribe((bId) => {
      this.updateClassCategoriesSelections(bId);
    });

    this.registrationForm
      .get('classCategoryId')
      ?.valueChanges.subscribe((ccId) => {
        this.updateClassSubjectsSelections(ccId, null);
      });

    this.registrationForm.get('subjectId')?.valueChanges.subscribe((sjId) => {
      if (sjId) {
        this.isDisplayClassSubjectsForTeacher = true;
      }
      this.updateClassSubjectsSelections(null, sjId);
    });
  }

  private updateValidators(role: string) {
    this.selectedRole = role;
    this.selectedClassSubjectIds = [];

    this.resetFormValue();

    const teacherControls = ['serviceStatus', 'isAvailable'];

    const studentControls = [
      'entranceYear',
      'estimatedExitYear',
      'classCategoryId',
      'classSubjectIds',
    ];

    if (this.selectedRole.toLocaleLowerCase() === this.teacherVariable) {
      teacherControls.forEach((control) => {
        this.registrationForm.get(control)?.setValidators(Validators.required);
      });
      studentControls.forEach((control) => {
        this.registrationForm.get(control)?.clearValidators();
      });
    } else if (this.selectedRole.toLocaleLowerCase() === this.studentVariable) {
      this.isDisplayClassSubjectsForTeacher = false;
      this.classSubjects = [];

      studentControls.forEach((control) => {
        this.registrationForm.get(control)?.setValidators(Validators.required);
      });
      teacherControls.forEach((control) => {
        this.registrationForm.get(control)?.clearValidators();
      });
    }

    this.registrationForm.updateValueAndValidity();
  }

  updateClassCategoriesSelections(batchId: string | null) {
    this.classCategories = this.allClassCategories;

    this.classCategories = this.allClassCategories.filter(
      (cc) => cc.batchId == batchId
    );
  }

  updateClassSubjectsSelections(
    selectedClassCategoryId: string | null,
    selectedSubjectId: string | null
  ) {
    if (this.selectedRole.toLocaleLowerCase() === this.teacherVariable) {
      this.classSubjects = this.allClassSubjects;

      if (selectedSubjectId != null) {
        this.classSubjects = this.allClassSubjects.filter(
          (cs: classSubjectResponse) => cs.subjectId === selectedSubjectId
        );
        this.classSubjects = this.classSubjects.filter(
          (cs: classSubjectResponse) =>
            !this.selectedClassSubjectIds.includes(cs.id!)
        );
      }
    } else if (this.selectedRole.toLocaleLowerCase() === this.studentVariable) {
      if (selectedClassCategoryId != null) {
        this.classSubjects = this.allClassSubjects.filter(
          (cs: classSubjectResponse) =>
            cs.classCategoryId === selectedClassCategoryId
        );
      }
    } else {
      this.classSubjects = [];
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      const formValues = this.registrationForm.value;
      const userAddRequest: userAddRequest = {
        registerForRole: formValues.registerForRole,
        fullName: formValues.fullName,
        emailAddress: formValues.emailAddress,
        mobileNumber: formValues.mobileNumber,
        dateOfBirth: formValues.dateOfBirth,
        gender: formValues.gender,
        serviceStatus: formValues.serviceStatus || null,
        isAvailable: formValues.isAvailable || false,
        entranceYear: formValues.entranceYear || null,
        estimatedExitYear: formValues.estimatedExitYear || null,
        classCategoryId: formValues.classCategoryId || null,
        classSubjectIds: formValues.classSubjectIds || [],
      };
      this.registerUser(userAddRequest);
    } else {
      this.markFormGroupTouched(this.registrationForm);
    }
  }

  private registerUser(request: userAddRequest) {
    this._registerService.registerUser(request).subscribe({
      next: (res) => {
        if (res) {
          this._alertService.displayAlert(
            'User has successfully created. Invitation to login has been sent to user email'
          );
          this.close();
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to register user');
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private resetFormValue() {
    Object.keys(this.registrationForm.controls).forEach((controlName) => {
      if (controlName != 'registerForRole') {
        this.registrationForm.get(controlName)?.reset();
      }
    });
  }

  onSubjectChange(subject: classSubjectResponse, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const isChecked = inputElement.checked;

    if (isChecked) {
      this.selectedClassSubjectIds.push(subject.id!);
    } else {
      if (this.selectedClassSubjectIds.includes(subject.id!)) {
        this.selectedClassSubjectIds = this.selectedClassSubjectIds.filter(
          (id) => id !== subject.id
        );
      }
    }

    this.checkedClassSubjects = this.allClassSubjects.filter((cs) =>
      this.selectedClassSubjectIds.includes(cs.id!)
    );

    this.registrationForm
      .get('classSubjectIds')
      ?.setValue(this.selectedClassSubjectIds);
  }

  isSubjectSelected(subjectId: string): boolean {
    const selectedSubjects =
      this.registrationForm.get('classSubjectIds')?.value || [];
    return selectedSubjects.includes(subjectId);
  }

  close() {
    this.popupForm.emit();
  }
}
