import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { roleResponse } from '../../../../models/Role';
import { AccessModuleService } from '../../../../services/access-module/access-module.service';
import { RoleService } from '../../../../services/role/role.service';
import { AlertService } from '../../../../../template/services/alert/alert.service';
import { accessModuleRequest } from '../../../../models/AccessModule';

@Component({
  selector: 'app-add-accessmodule',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [AlertService, RoleService, AccessModuleService],
  templateUrl: './add-accessmodule.component.html',
  styleUrl: './add-accessmodule.component.css',
})
export class AddAccessmoduleComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Output() popupForm = new EventEmitter<void>();

  allRoles: roleResponse[] = [];
  selectedRoleIds: string[] = [];

  accessModuleForm!: FormGroup;

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
    // role services
    this._roleService.getAll().subscribe({
      next: (res) => {
        if (res) {
          this.allRoles = res.sort((a: roleResponse, b: roleResponse) => {
            return a.title.localeCompare(b.title);
          });
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to get all roles');
      },
    });
  }

  initializeForm() {
    this.accessModuleForm = this.fb.group({
      name: ['', Validators.required],
      roles: [[], Validators.required],
    });
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoleIds.includes(roleId);
  }

  onRoleChange(roleId: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const isChecked = inputElement.checked;

    if (isChecked) {
      this.selectedRoleIds.push(roleId);
    } else {
      if (this.selectedRoleIds.includes(roleId)) {
        this.selectedRoleIds = this.selectedRoleIds.filter(
          (id) => id !== roleId
        );
      }
    }

    this.accessModuleForm.patchValue({
      roles: this.selectedRoleIds,
    });

    this.sortRolesWithSelectedOnTop();
  }

  sortRolesWithSelectedOnTop() {
    if (this.allRoles) {
      this.allRoles.sort((a, b) => {
        const aIsSelected = this.selectedRoleIds.includes(a.id!);
        const bIsSelected = this.selectedRoleIds.includes(b.id!);

        if (aIsSelected && !bIsSelected) return -1;
        if (!aIsSelected && bIsSelected) return 1;

        // If both are selected or both are not selected, maintain original order
        return a.title.localeCompare(b.title);
      });
    }
  }

  onSubmit() {
    // check validity
    if (this.accessModuleForm.invalid) {
      const invalidControls = this.getInvalidControls(this.accessModuleForm);
      if (invalidControls.length > 0) {
        this._alertService.displayAlert(
          `Please fill in all required fields: ${invalidControls.join(', ')}`
        );
      }
    }

    // create object
    if (this.accessModuleForm.valid) {
      const formValues = this.accessModuleForm.value;
      const request: accessModuleRequest = {
        name: formValues.name,
        roleIds: formValues.roles,
      };
      this.createModule(request);
    }
  }

  createModule(request: accessModuleRequest): void {
    this._accessModuleService.create(request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully created access module');
          this.close();
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to create access module');
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
