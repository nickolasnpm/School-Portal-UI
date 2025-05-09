import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertService } from '../../../../../template/services/alert/alert.service';
import { BatchService } from '../../../../services/batch/batch.service';
import { UserService } from '../../../../services/user/user.service';
import { userResponse } from '../../../../models/User';
import { batchRequest, batchResponse } from '../../../../models/Batch';
import { ClassStreamService } from '../../../../services/class-stream/class-stream.service';
import { ClassRankService } from '../../../../services/class-rank/class-rank.service';
import { classStreamResponse } from '../../../../models/ClassStream';
import { classRankResponse } from '../../../../models/ClassRank';

@Component({
  selector: 'app-view-edit-batch',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [AlertService, BatchService, UserService],
  templateUrl: './view-edit-batch.component.html',
  styleUrl: './view-edit-batch.component.css',
})
export class ViewEditBatchComponent implements OnInit, OnChanges {
  @Input() isEdit: boolean = false;
  @Input() isAdmin: boolean = false;

  @Input() batch?: batchResponse;
  @Input() allBatches: batchResponse[] = [];
  @Input() allTeachers: userResponse[] = [];

  @Output() popupForm = new EventEmitter<void>();
  @Output() batchSaved = new EventEmitter<batchResponse>();

  batchForm!: FormGroup;

  allStreams: classStreamResponse[] = [];
  allRanks: classRankResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private _alertService: AlertService,
    private _batchService: BatchService,
    private _rankService: ClassRankService,
    private _streamService: ClassStreamService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.updateForms();
    this.loadStreams();
    this.loadRanks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['batch'] && this.batch) {
      this.initializeBatchData();
    }

    if (!this.isEdit) {
      this.batchForm.disable();
    }
  }

  initializeForm() {
    this.batchForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      isActive: [true],
      teacherId: [''],
      streams: [[], Validators.required],
      ranks: [[], Validators.required],
    });
  }

  initializeBatchData() {
    if (this.batch) {
      this.batchForm.patchValue({
        name: this.batch.name,
        code: this.batch.code,
        isActive: this.batch.isActive,
        teacherId: this.batch.teacherId,
      });
    }
  }

  updateForms() {
    this.batchForm.get('name')?.valueChanges.subscribe((n: string) => {
      this.verifyPossibleName(n);
    });

    this.batchForm.get('code')?.valueChanges.subscribe((c: string) => {
      this.verifyPossibleCode(c);
    });

    this.batchForm.get('teacherId')?.valueChanges.subscribe((tId: string) => {
      this.verifyPossibleTeacher(tId);
    });
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

  loadStreams() {
    this._streamService.getAll(true).subscribe({
      next: (res: classStreamResponse[]) => {
        if (res) {
          this.allStreams = res;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load class stream list');
      },
    });
  }

  loadRanks() {
    this._rankService.getAll(true).subscribe({
      next: (res: classRankResponse[]) => {
        if (res) {
          this.allRanks = res;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load class rank list');
      },
    });
  }

  getBatch(name: string): batchResponse | undefined {
    const batch = this.allBatches.find(
      (ab) => ab.name.toLowerCase() === name.toLowerCase()
    );

    if (batch) {
      return batch;
    }

    return undefined;
  }

  save(batch: batchResponse) {
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

      const updatedBatch = this.updateBatch(batch.id, request);

      if (updatedBatch) {
        this.batchSaved.emit(batch);
      }

      this.close();
    }
  }

  updateBatch(id: string, request: batchRequest): boolean {
    this._batchService.update(id, request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully updating batch');
          return true;
        }
        return false;
      },
      error: (err: any) => {
        console.error('Error updating batch:', err);
        this._alertService.displayAlert('Failed to update batch');
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

  deleteBatch(batch: batchResponse) {
    const proceed = confirm(
      `Are you sure you want to delete this batch - ${batch.name} - permanently`
    );

    if (proceed) {
      this._batchService.delete(batch.id).subscribe({
        next: (res: boolean) => {
          if (res) {
            this._alertService.displayAlert('Successfully deleting batch');
            this.close();
          }
        },
        error: (err: any) => {
          console.error('Error deleting batch:', err);
          this._alertService.displayAlert('Failed to delete batch');
        },
      });
    }
  }

  close() {
    this.popupForm.emit();
  }
}
