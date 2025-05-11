import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
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
  selector: 'app-view-edit-stream',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [AlertService, ClassStreamService, UserService],
  templateUrl: './view-edit-stream.component.html',
  styleUrl: './view-edit-stream.component.css',
})
export class ViewEditStreamComponent implements OnInit, OnChanges {
  @Input() isEdit: boolean = false;
  @Input() isAdmin: boolean = false;

  @Input() stream?: classStreamResponse;
  @Input() allStreams: classStreamResponse[] = [];

  @Output() popupForm = new EventEmitter<void>();
  @Output() streamSaved = new EventEmitter<classStreamResponse>();

  streamForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _alertService: AlertService,
    private _streamService: ClassStreamService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.updateForms();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stream'] && this.stream) {
      this.initializeStreamData();
    }

    if (!this.isEdit) {
      this.streamForm.disable();
    }
  }

  initializeForm() {
    this.streamForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      isActive: [true],
    });
  }

  initializeStreamData() {
    if (this.stream) {
      this.streamForm.patchValue({
        name: this.stream.name,
        code: this.stream.code,
        isActive: this.stream.isActive,
      });
    }
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

  save(stream: classStreamResponse) {
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

      const updatedStream = this.updateStream(stream.id, request);

      if (updatedStream) {
        this.streamSaved.emit(stream);
      }

      this.close();
    }
  }

  updateStream(id: string, request: classStreamRequest): boolean {
    this._streamService.update(id, request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully updating stream');
          return true;
        }
        return false;
      },
      error: (err: any) => {
        console.error('Error updating stream:', err);
        this._alertService.displayAlert('Failed to update stream');
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

  deleteStream(stream: classStreamResponse) {
    const proceed = confirm(
      `Are you sure you want to delete this stream - ${stream.name} - permanently`
    );

    if (proceed) {
      this._streamService.delete(stream.id).subscribe({
        next: (res: boolean) => {
          if (res) {
            this._alertService.displayAlert('Successfully deleting stream');
            this.close();
          }
        },
        error: (err: any) => {
          console.error('Error deleting stream:', err);
          this._alertService.displayAlert('Failed to delete stream');
        },
      });
    }
  }

  close() {
    this.popupForm.emit();
  }
}
