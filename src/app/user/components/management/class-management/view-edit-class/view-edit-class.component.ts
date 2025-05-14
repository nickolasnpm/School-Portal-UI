import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AlertService } from '../../../../../template/services/alert/alert.service';
import { UserService } from '../../../../services/user/user.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ClassCategoryService } from '../../../../services/class-category/class-category.service';
import { SubjectService } from '../../../../services/subject/subject.service';
import { batchResponse } from '../../../../models/Batch';
import {
  classCategoryRequest,
  classCategoryResponse,
} from '../../../../models/ClassCategory';
import { classRankResponse } from '../../../../models/ClassRank';
import { classStreamResponse } from '../../../../models/ClassStream';
import { subjectResponse } from '../../../../models/Subject';
import { GetYears } from '../../../../shared/get-years/get-years';
import { SubjectCodeTransformPipe } from '../../../../pipes/subject-code-transform.pipe';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-view-edit-class',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SubjectCodeTransformPipe],
  providers: [AlertService, UserService],
  templateUrl: './view-edit-class.component.html',
  styleUrl: './view-edit-class.component.css',
})
export class ViewEditClassComponent implements OnInit, OnChanges {
  @Input() isEdit: boolean = false;
  @Input() isAdmin: boolean = false;

  @Input() category?: classCategoryResponse;
  @Input() allCategories: classCategoryResponse[] = [];
  @Input() allBatches: batchResponse[] = [];
  @Input() allRanks: classRankResponse[] = [];
  @Input() allStreams: classStreamResponse[] = [];

  @Output() popupForm = new EventEmitter<void>();
  @Output() categorySaved = new EventEmitter<classCategoryResponse>();

  categoryForm!: FormGroup;
  categoryCode: string = '';

  availableBatches: batchResponse[] = [];
  availableRanks: classRankResponse[] = [];
  availableStreams: classStreamResponse[] = [];

  allYears: number[] = GetYears.getYears();
  allSubjects: subjectResponse[] = [];
  checkedSubjects: subjectResponse[] = [];
  originalSubjectIds: string[] = [];
  selectedSubjectIds: string[] = [];

  constructor(
    private fb: FormBuilder,
    private _alertService: AlertService,
    private _categoryService: ClassCategoryService,
    private _subjectService: SubjectService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSubjects();
    this.sortSelections();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && this.category) {
      this.loadSubjects()
        .pipe(
          switchMap(() => {
            this.initializeCategoryData();
            return [];
          })
        )
        .subscribe();
    }

    if (!this.isEdit) {
      this.categoryForm.disable();
    }
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

  initializeCategoryData() {
    if (this.category) {
      this.categoryCode = this.category.code;

      const selectedSubjects = this.allSubjects.filter((s) =>
        this.category?.subjects?.includes(s.name)
      );

      this.selectedSubjectIds = selectedSubjects.map((s) => s.id);
      this.originalSubjectIds = [...this.selectedSubjectIds];

      this.categoryForm.patchValue({
        academicYear: this.category.academicYear,
        batchId: this.category.batchId,
        classRankId: this.category.classRankId,
        classStreamId: this.category.classStreamId,
        subjectIds: this.selectedSubjectIds,
      });

      // Disable all controls except subjectIds
      this.categoryForm.get('academicYear')?.disable();
      this.categoryForm.get('batchId')?.disable();
      this.categoryForm.get('classRankId')?.disable();
      this.categoryForm.get('classStreamId')?.disable();
    }
  }

  loadSubjects() {
    return this._subjectService.getAll().pipe(
      tap({
        next: (result: subjectResponse[]) => {
          if (result) {
            this.allSubjects = result;
          }
        },
        error: (err) => {
          console.error(err.error);
          this._alertService.displayAlert('Failed to load subject list');
        },
      })
    );
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
    const selectedSubjectIds = this.categoryForm.get('subjectIds')?.value || [];
    return selectedSubjectIds.includes(subjectId);
  }

  save(category: classCategoryResponse) {
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
      this.verifyPossibleCode(category, request);
    }
  }

  verifyPossibleCode(
    response: classCategoryResponse,
    request: classCategoryRequest
  ): void {
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
      const updatedCategory = this.updateCategory(response.id, request);

      if (updatedCategory) {
        this.categorySaved.emit(response);
      }

      this.close();
    }
  }

  areSubjectIdsEqual(): boolean {
    if (this.originalSubjectIds.length !== this.selectedSubjectIds.length) {
      return false;
    }

    const sortedOriginal = [...this.originalSubjectIds].sort();
    const sortedSelected = [...this.selectedSubjectIds].sort();

    return sortedOriginal.every(
      (value, index) => value === sortedSelected[index]
    );
  }

  updateCategory(id: string, request: classCategoryRequest): boolean {
    this._categoryService.update(id, request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully updating category');
          return true;
        }
        return false;
      },
      error: (err: any) => {
        console.error('Error updating category:', err);
        this._alertService.displayAlert('Failed to update category');
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

  deleteCategory(category: classCategoryResponse) {
    const proceed = confirm(
      `Are you sure you want to delete this category - ${category.code} - permanently`
    );

    if (proceed) {
      this._categoryService.delete(category.id).subscribe({
        next: (res: boolean) => {
          if (res) {
            this._alertService.displayAlert('Successfully deleting category');
            this.close();
          }
        },
        error: (err: any) => {
          console.error('Error deleting category:', err);
          this._alertService.displayAlert('Failed to delete category');
        },
      });
    }
  }

  close() {
    this.popupForm.emit();
  }
}
