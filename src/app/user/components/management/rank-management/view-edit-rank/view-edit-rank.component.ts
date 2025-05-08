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
import { ClassRankService } from '../../../../services/class-rank/class-rank.service';
import { UserService } from '../../../../services/user/user.service';
import {
  classRankRequest,
  classRankResponse,
} from '../../../../models/ClassRank';

@Component({
  selector: 'app-view-edit-rank',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [AlertService, ClassRankService, UserService],
  templateUrl: './view-edit-rank.component.html',
  styleUrl: './view-edit-rank.component.css',
})
export class ViewEditRankComponent implements OnInit, OnChanges {
  @Input() isEdit: boolean = false;
  @Input() isAdmin: boolean = false;

  @Input() rank?: classRankResponse;
  @Input() allRanks: classRankResponse[] = [];

  @Output() popupForm = new EventEmitter<void>();
  @Output() rankSaved = new EventEmitter<classRankResponse>();

  rankForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _alertService: AlertService,
    private _rankService: ClassRankService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.updateForms();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rank'] && this.rank) {
      this.initializeRankData();
    }

    if (!this.isEdit) {
      this.rankForm.disable();
    }
  }

  initializeForm() {
    this.rankForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      isActive: [true],
    });
  }

  initializeRankData() {
    if (this.rank) {
      this.rankForm.patchValue({
        name: this.rank.name,
        code: this.rank.code,
        isActive: this.rank.isActive,
      });
    }
  }

  updateForms() {
    this.rankForm.get('name')?.valueChanges.subscribe((n: string) => {
      this.verifyPossibleName(n);
    });

    this.rankForm.get('code')?.valueChanges.subscribe((c: string) => {
      this.verifyPossibleCode(c);
    });
  }

  verifyPossibleName(name: string): void {
    const existingName = this.allRanks.find(
      (b) => b.name.toLowerCase() == name.toLowerCase()
    );

    if (existingName) {
      this.rankForm.get('name')?.markAsTouched();
      this.rankForm.get('name')?.setErrors({ nameExist: true });
    } else {
      this.rankForm.get('name')?.setErrors(null);
    }
  }

  verifyPossibleCode(code: string): void {
    const existingCode = this.allRanks.find(
      (b) => b.code.toLowerCase() == code.toLowerCase()
    );

    if (existingCode) {
      this.rankForm.get('code')?.markAsTouched();
      this.rankForm.get('code')?.setErrors({ codeExist: true });
    } else {
      this.rankForm.get('code')?.setErrors(null);
    }
  }

  save(rank: classRankResponse) {
    // check validity
    if (this.rankForm.invalid) {
      const invalidControls = this.getInvalidControls(this.rankForm);
      if (invalidControls.length > 0) {
        this._alertService.displayAlert(
          `Please fill in all required fields: ${invalidControls.join(', ')}`
        );
      }
    }

    // create object
    if (this.rankForm.valid) {
      const formValues = this.rankForm.value;
      const request: classRankRequest = {
        name: formValues.name,
        code: formValues.code,
        isActive: formValues.isActive,
      };

      const updatedRank = this.updateRank(rank.id, request);

      if (updatedRank) {
        this.rankSaved.emit(rank);
      }

      this.close();
    }
  }

  updateRank(id: string, request: classRankRequest): boolean {
    this._rankService.update(id, request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully updating rank');
          return true;
        }
        return false;
      },
      error: (err: any) => {
        console.error('Error updating rank:', err);
        this._alertService.displayAlert('Failed to update rank');
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

  deleteRank(rank: classRankResponse) {
    const proceed = confirm(
      `Are you sure you want to delete this rank - ${rank.name} - permanently`
    );

    if (proceed) {
      this._rankService.delete(rank.id).subscribe({
        next: (res: boolean) => {
          if (res) {
            this._alertService.displayAlert('Successfully deleting rank');
            this.close();
          }
        },
        error: (err: any) => {
          console.error('Error deleting rank:', err);
          this._alertService.displayAlert('Failed to delete rank');
        },
      });
    }
  }

  close() {
    this.popupForm.emit();
  }
}
