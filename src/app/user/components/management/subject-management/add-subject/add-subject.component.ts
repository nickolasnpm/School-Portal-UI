import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertService } from '../../../../../template/services/alert/alert.service';
import { UserService } from '../../../../services/user/user.service';
import { SubjectService } from '../../../../services/subject/subject.service';
import { subjectRequest, subjectResponse } from '../../../../models/Subject';
import { userResponse } from '../../../../models/User';

@Component({
  selector: 'app-add-subject',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [AlertService, UserService, SubjectService],
  templateUrl: './add-subject.component.html',
  styleUrl: './add-subject.component.css',
})
export class AddSubjectComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Input() allSubjects: subjectResponse[] = [];
  @Input() allTeachers: userResponse[] = [];
  @Output() popupForm = new EventEmitter<void>();

  subjectForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _alertService: AlertService,
    private _subjectService: SubjectService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.updateForms();
  }

  initializeForm() {
    this.subjectForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      teacherId: ['', Validators.required],
    });
  }

  updateForms() {
    this.subjectForm.get('name')?.valueChanges.subscribe((n: string) => {
      this.verifyPossibleName(n);
    });

    this.subjectForm.get('code')?.valueChanges.subscribe((c: string) => {
      this.verifyPossibleCode(c);
    });

    this.subjectForm.get('teacherId')?.valueChanges.subscribe((tId: string) => {
      this.verifyPossibleTeacher(tId);
    });
  }

  verifyPossibleName(name: string): void {
    const existingName = this.allSubjects.find(
      (b) => b.name.toLowerCase() == name.toLowerCase()
    );

    if (existingName) {
      this.subjectForm.get('name')?.markAsTouched();
      this.subjectForm.get('name')?.setErrors({ nameExist: true });
    } else {
      this.subjectForm.get('name')?.setErrors(null);
    }
  }

  verifyPossibleCode(code: string): void {
    const existingCode = this.allSubjects.find(
      (b) => b.code.toLowerCase() == code.toLowerCase()
    );

    if (existingCode) {
      this.subjectForm.get('code')?.markAsTouched();
      this.subjectForm.get('code')?.setErrors({ codeExist: true });
    } else {
      this.subjectForm.get('code')?.setErrors(null);
    }
  }

  verifyPossibleTeacher(teacherId: string): void {
    if (
      this.subjectForm.get('name')?.valid &&
      this.subjectForm.get('code')?.valid
    ) {
      const user = this.getTeacher(teacherId);
      const teacher = user?.teacher;

      if (
        teacher &&
        teacher.responsibilityType &&
        teacher.responsibilityFocus
      ) {
        const proceed = confirm(
          `This teacher ${user.fullName} is responsible to manage a ${teacher.responsibilityType} (${teacher.responsibilityFocus}). Do you still want to proceed?`
        );

        if (!proceed) {
          this.subjectForm.get('teacherId')?.setValue('');
        }
      }
    } else {
      this._alertService.displayAlert(
        'You have to select valid code and name before you can select responsible teacher'
      );
    }
  }

  loadTeacher(teacherId?: string): string {
    if (teacherId) {
      const teacher = this.allTeachers.find(
        (at) => at.teacher?.id == teacherId
      );
      if (teacher) {
        return teacher.fullName;
      }
    }

    return '-';
  }

  getTeacher(teacherId: string): userResponse | undefined {
    const teacher = this.allTeachers.find((at) => at.teacher?.id == teacherId);

    if (teacher) {
      return teacher;
    }

    return undefined;
  }

  onSubmit() {
    // check validity
    if (this.subjectForm.invalid) {
      const invalidControls = this.getInvalidControls(this.subjectForm);
      if (invalidControls.length > 0) {
        this._alertService.displayAlert(
          `Please fill in all required fields: ${invalidControls.join(', ')}`
        );
      }
    }

    // create object
    if (this.subjectForm.valid) {
      const formValues = this.subjectForm.value;
      const request: subjectRequest = {
        name: formValues.name,
        code: formValues.code,
        teacherId: formValues.teacherId,
      };
      this.createSubject(request);
    }
  }

  createSubject(request: subjectRequest): void {
    this._subjectService.create(request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully created subject');
          this.close();
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to create subject');
      },
    });
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

  close() {
    this.popupForm.emit();
  }
}
