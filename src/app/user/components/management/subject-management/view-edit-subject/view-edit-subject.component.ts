import { CommonModule } from '@angular/common';
import {
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertService } from '../../../../../template/services/alert/alert.service';
import { SubjectService } from '../../../../services/subject/subject.service';
import { subjectRequest, subjectResponse } from '../../../../models/Subject';
import { userResponse } from '../../../../models/User';

@Component({
  selector: 'app-view-edit-subject',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [AlertService, SubjectService],
  templateUrl: './view-edit-subject.component.html',
  styleUrl: './view-edit-subject.component.css',
})
export class ViewEditSubjectComponent implements OnInit, OnChanges {
  @Input() isEdit: boolean = false;
  @Input() isAdmin: boolean = false;

  @Input() subject?: subjectResponse;
  @Input() allSubjects: subjectResponse[] = [];
  @Input() allTeachers: userResponse[] = [];

  @Output() popupForm = new EventEmitter<void>();
  @Output() subjectSaved = new EventEmitter<subjectResponse>();

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subject'] && this.subject) {
      this.initializeSubjectData();
    }

    if (!this.isEdit) {
      this.subjectForm.disable();
    }
  }

  initializeForm() {
    this.subjectForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      isActive: [true],
      teacherId: [''],
    });
  }

  initializeSubjectData() {
    if (this.subject) {
      this.subjectForm.patchValue({
        name: this.subject.name,
        code: this.subject.code,
        teacherId: this.subject.teacherId,
      });
    }
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
      const teacher = this.getTeacher(teacherId);
      if (teacher) {
        return teacher.fullName;
      }
    }

    return '-';
  }

  getTeacher(teacherId: string): userResponse | undefined {
    const teacher = this.allTeachers.find((at) => at.teacher?.id === teacherId);

    if (teacher) {
      return teacher;
    }

    return undefined;
  }

  save(subject: subjectResponse) {
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

      const updatedSubject = this.updateSubject(subject.id, request);

      if (updatedSubject) {
        this.subjectSaved.emit(subject);
      }

      this.close();
    }
  }

  updateSubject(id: string, request: subjectRequest): boolean {
    this._subjectService.update(id, request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully updating subject');
          return true;
        }
        return false;
      },
      error: (err: any) => {
        console.error('Error updating subject:', err);
        this._alertService.displayAlert('Failed to update subject');
      },
    });

    return false;
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

  deleteSubject(subject: subjectResponse) {
    const proceed = confirm(
      `Are you sure you want to delete this subject - ${subject.name} - permanently`
    );

    if (proceed) {
      this._subjectService.delete(subject.id).subscribe({
        next: (res: boolean) => {
          if (res) {
            this._alertService.displayAlert('Successfully deleting subject');
            this.close();
          }
        },
        error: (err: any) => {
          console.error('Error deleting subject:', err);
          this._alertService.displayAlert('Failed to delete subject');
        },
      });
    }
  }

  close() {
    this.popupForm.emit();
  }
}
