import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertService } from '../../../../../template/services/alert/alert.service';
import { BatchService } from '../../../../services/batch/batch.service';
import { UserService } from '../../../../services/user/user.service';
import { StorageService } from '../../../../../template/services/storage/storage.service';
import { batchRequest, batchResponse } from '../../../../models/Batch';
import { userResponse } from '../../../../models/User';

@Component({
  selector: 'app-add-batch',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [AlertService, BatchService, UserService],
  templateUrl: './add-batch.component.html',
  styleUrl: './add-batch.component.css',
})
export class AddBatchComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Input() allBatches: batchResponse[] = [];
  @Input() allTeachers: userResponse[] = [];
  @Output() popupForm = new EventEmitter<void>();

  batchForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _alertService: AlertService,
    private _batchService: BatchService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.updateForms();
  }

  initializeForm() {
    this.batchForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      isActive: [true],
      teacherId: ['', Validators.required],
    });
  }

  updateForms() {
    this.batchForm.get('name')?.valueChanges.subscribe((n: string) => {
      this.verifyPossibleName(n);
    });

    this.batchForm.get('code')?.valueChanges.subscribe((c: string) => {
      this.verifyPossibleCode(c);
    });

    if (
      this.batchForm.get('name')?.valid &&
      this.batchForm.get('code')?.valid
    ) {
      this.batchForm.get('teacherId')?.valueChanges.subscribe((tId: string) => {
        this.verifyPossibleTeacher(tId);
      });
    }
  }

  verifyPossibleName(name: string): void {
    const existingName = this.allBatches.find(
      (b) => b.name.toLowerCase() == name.toLowerCase()
    );

    if (existingName) {
      this.batchForm.get('name')?.markAsTouched();
      this.batchForm.get('name')?.setErrors({ nameExist: true });
    } else {
      this.batchForm.get('name')?.setErrors(null);
    }
  }

  verifyPossibleCode(code: string): void {
    const existingCode = this.allBatches.find(
      (b) => b.code.toLowerCase() == code.toLowerCase()
    );

    if (existingCode) {
      this.batchForm.get('code')?.markAsTouched();
      this.batchForm.get('code')?.setErrors({ codeExist: true });
    } else {
      this.batchForm.get('code')?.setErrors(null);
    }
  }

  verifyPossibleTeacher(teacherId: string): void {
    const user = this.getTeacher(teacherId);
    const teacher = user?.teacher;

    if (teacher && teacher.responsibilityType && teacher.responsibilityFocus) {
      const proceed = confirm(
        `This teacher ${user.fullName} is responsible to manage a ${teacher.responsibilityType} (${teacher.responsibilityFocus}). Do you still want to proceed?`
      );

      if (!proceed) {
        this.batchForm.get('teacherId')?.setValue('');
      }
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
    if (this.batchForm.invalid) {
      const invalidControls = this.getInvalidControls(this.batchForm);
      if (invalidControls.length > 0) {
        this._alertService.displayAlert(
          `Please fill in all required fields: ${invalidControls.join(', ')}`
        );
      }
    }

    // create object
    if (this.batchForm.valid) {
      const formValues = this.batchForm.value;
      const request: batchRequest = {
        name: formValues.name,
        code: formValues.code,
        isActive: formValues.isActive,
        teacherId: formValues.teacherId,
      };
      this.createBatch(request);
    }
  }

  createBatch(request: batchRequest): void {
    this._batchService.create(request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully created batch');
          this.close();
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to create batch');
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
