import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AlertService } from '../../../../../template/services/alert/alert.service';
import { RoleService } from '../../../../services/role/role.service';
import { AccessModuleService } from '../../../../services/access-module/access-module.service';
import { accessModuleResponse } from '../../../../models/AccessModule';
import { roleRequest } from '../../../../models/Role';

@Component({
  selector: 'app-add-role',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [AlertService, RoleService, AccessModuleService],
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.css',
})
export class AddRoleComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Output() popupForm = new EventEmitter<void>();

  allAccessModules: accessModuleResponse[] = [];
  selectedAccessModuleIds: string[] = [];

  roleForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _alertService: AlertService,
    private _roleService: RoleService,
    private _accessModuleService: AccessModuleService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeServices();
  }

  initializeServices(): void {
    this._accessModuleService.getAll().subscribe({
      next: (res) => {
        if (res) {
          this.allAccessModules = res.sort(
            (a: accessModuleResponse, b: accessModuleResponse) => {
              return a.name.localeCompare(b.name);
            }
          );
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to get all roles');
      },
    });
  }

  initializeForm() {
    this.roleForm = this.fb.group({
      title: ['', Validators.required],
      accessModules: [[], Validators.required],
    });
  }

  isAccessModuleSelected(accessModuleId: string): boolean {
    return this.selectedAccessModuleIds.includes(accessModuleId);
  }

  onAccessModuleChange(accessModuleId: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const isChecked = inputElement.checked;

    if (isChecked) {
      this.selectedAccessModuleIds.push(accessModuleId);
    } else {
      if (this.selectedAccessModuleIds.includes(accessModuleId)) {
        this.selectedAccessModuleIds = this.selectedAccessModuleIds.filter(
          (id) => id !== accessModuleId
        );
      }
    }

    this.roleForm.patchValue({
      accessModules: this.selectedAccessModuleIds,
    });

    this.sortRolesWithSelectedOnTop();
  }

  sortRolesWithSelectedOnTop() {
    if (this.allAccessModules) {
      this.allAccessModules.sort((a, b) => {
        const aIsSelected = this.selectedAccessModuleIds.includes(a.id!);
        const bIsSelected = this.selectedAccessModuleIds.includes(b.id!);

        if (aIsSelected && !bIsSelected) return -1;
        if (!aIsSelected && bIsSelected) return 1;

        // If both are selected or both are not selected, maintain original order
        return a.name.localeCompare(b.name);
      });
    }
  }

  onSubmit() {
    // check validity
    if (this.roleForm.invalid) {
      const invalidControls = this.getInvalidControls(this.roleForm);
      if (invalidControls.length > 0) {
        this._alertService.displayAlert(
          `Please fill in all required fields: ${invalidControls.join(', ')}`
        );
      }
    }

    // create object
    if (this.roleForm.valid) {
      const formValues = this.roleForm.value;
      const request: roleRequest = {
        title: formValues.title,
      };
      this.createRole(request);
    }
  }

  createRole(request: roleRequest): void {
    this._roleService.create(request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully created role');
          this.close();
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to create role');
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
