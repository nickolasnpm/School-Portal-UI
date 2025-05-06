import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StorageService } from '../../../../template/services/storage/storage.service';
import { AlertService } from '../../../../template/services/alert/alert.service';
import { ClassRankService } from '../../../services/class-rank/class-rank.service';
import { UserService } from '../../../services/user/user.service';
import { classRankRequest, classRankResponse } from '../../../models/ClassRank';

@Component({
  selector: 'app-add-rank',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [AlertService, ClassRankService, UserService],
  templateUrl: './add-rank.component.html',
  styleUrl: './add-rank.component.css',
})
export class AddRankComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Input() allRanks: classRankResponse[] = [];
  @Output() popupForm = new EventEmitter<void>();

  rankForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _alertService: AlertService,
    private _classRankService: ClassRankService
  ) {
    this.initializeForm();
  }
  ngOnInit(): void {
    this.updateForms();
  }

  initializeForm() {
    this.rankForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      isActive: [true],
    });
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

  onSubmit() {
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
      this.createRank(request);
    }
  }

  createRank(request: classRankRequest): void {
    this._classRankService.create(request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully created rank');
          this.close();
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to create rank');
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
