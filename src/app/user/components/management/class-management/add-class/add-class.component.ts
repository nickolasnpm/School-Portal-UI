import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ClassCategoryService } from '../../../../services/class-category/class-category.service';
import { BatchService } from '../../../../services/batch/batch.service';
import { ClassStreamService } from '../../../../services/class-stream/class-stream.service';
import { ClassRankService } from '../../../../services/class-rank/class-rank.service';
import { AlertService } from '../../../../../template/services/alert/alert.service';
import { classRankResponse } from '../../../../models/ClassRank';
import {
  classCategoryRequest,
  classCategoryResponse,
} from '../../../../models/ClassCategory';
import { batchResponse } from '../../../../models/Batch';
import { classStreamResponse } from '../../../../models/ClassStream';
import { SubjectService } from '../../../../services/subject/subject.service';
import { subjectResponse } from '../../../../models/Subject';
import { GetYears } from '../../../../shared/get-years/get-years';
import { SubjectCodeTransformPipe } from '../../../../pipes/subject-code-transform.pipe';

@Component({
  selector: 'app-add-class',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SubjectCodeTransformPipe],
  providers: [
    AlertService,
    ClassCategoryService,
    BatchService,
    ClassStreamService,
    ClassRankService,
  ],
  templateUrl: './add-class.component.html',
  styleUrl: './add-class.component.css',
})
export class AddClassComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Input() allCategories: classCategoryResponse[] = [];
  @Input() allBatches: batchResponse[] = [];
  @Input() allRanks: classRankResponse[] = [];
  @Input() allStreams: classStreamResponse[] = [];
  @Output() popupForm = new EventEmitter<void>();

  categoryForm!: FormGroup;

  availableBatches: batchResponse[] = [];
  availableRanks: classRankResponse[] = [];
  availableStreams: classStreamResponse[] = [];

  allYears: number[] = GetYears.getYears();
  allSubjects: subjectResponse[] = [];
  checkedSubjects: subjectResponse[] = [];
  selectedSubjectIds: string[] = [];

  constructor(
    private fb: FormBuilder,
    private _alertService: AlertService,
    private _classCategoryService: ClassCategoryService,
    private _subjectService: SubjectService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSubjects();
    this.sortSelections();
  }

  initializeForm() {
    this.categoryForm = this.fb.group({
      academicYear: [0, Validators.required],
      batchId: ['', Validators.required],
      classRankId: ['', Validators.required],
      classStreamId: ['', Validators.required],
      subjectIds: [[], Validators.required],
    });
  }

  loadSubjects() {
    this._subjectService.getAll().subscribe({
      next: (result: subjectResponse[]) => {
        if (result) {
          this.allSubjects = result;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load subject list');
      },
    });
  }

  sortSelections() {
    this.availableBatches = [...this.allBatches].sort((a, b) => {
      return a.code.localeCompare(b.code);
    });

    this.availableRanks = [...this.allRanks].sort((a, b) => {
      return a.code.localeCompare(b.code);
    });

    this.availableStreams = [...this.allStreams].sort((a, b) => {
      return a.code.localeCompare(b.code);
    });
  }

  verifyPossibleCode(request: classCategoryRequest): void {
    const selectedBatch = this.allBatches.find(
      (batch) => batch.id === request.batchId
    );
    const selectedRank = this.allRanks.find(
      (rank) => rank.id === request.classRankId
    );
    const selectedStream = this.allStreams.find(
      (stream) => stream.id === request.classStreamId
    );

    // Create category code using the formula
    const possibleCode = `${selectedBatch?.code}-${selectedStream?.code}-${selectedRank?.code}`;

    const existingCode = this.allCategories.find(
      (b) =>
        b.code.toLowerCase() === possibleCode.toLowerCase() &&
        b.academicYear === request.academicYear
    );

    if (existingCode) {
      this.categoryForm.get('code')?.markAsTouched();
      this.categoryForm.get('code')?.setErrors({ codeExist: true });
    } else {
      this.categoryForm.get('code')?.setErrors(null);
      this.createCategory(request);
    }
  }

  onSubjectChange(subject: subjectResponse, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const isChecked = inputElement.checked;

    if (isChecked) {
      this.selectedSubjectIds.push(subject.id!);
    } else {
      if (this.selectedSubjectIds.includes(subject.id!)) {
        this.selectedSubjectIds = this.selectedSubjectIds.filter(
          (id) => id !== subject.id
        );
      }
    }

    this.checkedSubjects = this.allSubjects.filter((cs) =>
      this.selectedSubjectIds.includes(cs.id!)
    );

    this.categoryForm.get('subjectIds')?.setValue(this.selectedSubjectIds);
  }

  isSubjectSelected(subjectId: string): boolean {
    const selectedSubjects = this.categoryForm.get('subjectIds')?.value || [];
    return selectedSubjects.includes(subjectId);
  }

  onSubmit() {
    // check validity
    if (this.categoryForm.invalid) {
      const invalidControls = this.getInvalidControls(this.categoryForm);
      if (invalidControls.length > 0) {
        this._alertService.displayAlert(
          `Please fill in all required fields: ${invalidControls.join(', ')}`
        );
      }
    }

    // create object
    if (this.categoryForm.valid) {
      const formValues = this.categoryForm.value;
      const request: classCategoryRequest = {
        academicYear: formValues.academicYear,
        batchId: formValues.batchId,
        classRankId: formValues.classRankId,
        classStreamId: formValues.classStreamId,
        subjectIds: formValues.subjectIds,
      };
      this.verifyPossibleCode(request);
    }
  }

  createCategory(request: classCategoryRequest): void {
    this._classCategoryService.create(request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully created category');
          this.close();
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to create category');
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
