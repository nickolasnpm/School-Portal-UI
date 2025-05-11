import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertService } from '../../../../../template/services/alert/alert.service';
import { ClassStreamService } from '../../../../services/class-stream/class-stream.service';
import { UserService } from '../../../../services/user/user.service';
import {
  classStreamRequest,
  classStreamResponse,
} from '../../../../models/ClassStream';

@Component({
  selector: 'app-add-stream',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [AlertService, ClassStreamService, UserService],
  templateUrl: './add-stream.component.html',
  styleUrl: './add-stream.component.css',
})
export class AddStreamComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Input() allStreams: classStreamResponse[] = [];
  @Output() popupForm = new EventEmitter<void>();

  streamForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _alertService: AlertService,
    private _classStreamService: ClassStreamService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.updateForms();
  }

  initializeForm() {
    this.streamForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      isActive: [true],
    });
  }

  updateForms() {
    this.streamForm.get('name')?.valueChanges.subscribe((n: string) => {
      this.verifyPossibleName(n);
    });

    this.streamForm.get('code')?.valueChanges.subscribe((c: string) => {
      this.verifyPossibleCode(c);
    });
  }

  verifyPossibleName(name: string): void {
    const existingName = this.allStreams.find(
      (b) => b.name.toLowerCase() == name.toLowerCase()
    );

    if (existingName) {
      this.streamForm.get('name')?.markAsTouched();
      this.streamForm.get('name')?.setErrors({ nameExist: true });
    } else {
      this.streamForm.get('name')?.setErrors(null);
    }
  }

  verifyPossibleCode(code: string): void {
    const existingCode = this.allStreams.find(
      (b) => b.code.toLowerCase() == code.toLowerCase()
    );

    if (existingCode) {
      this.streamForm.get('code')?.markAsTouched();
      this.streamForm.get('code')?.setErrors({ codeExist: true });
    } else {
      this.streamForm.get('code')?.setErrors(null);
    }
  }

  onSubmit() {
    // check validity
    if (this.streamForm.invalid) {
      const invalidControls = this.getInvalidControls(this.streamForm);
      if (invalidControls.length > 0) {
        this._alertService.displayAlert(
          `Please fill in all required fields: ${invalidControls.join(', ')}`
        );
      }
    }

    // create object
    if (this.streamForm.valid) {
      const formValues = this.streamForm.value;
      const request: classStreamRequest = {
        name: formValues.name,
        code: formValues.code,
        isActive: formValues.isActive,
      };
      this.createStream(request);
    }
  }

  createStream(request: classStreamRequest): void {
    this._classStreamService.create(request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully created stream');
          this.close();
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to create stream');
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
