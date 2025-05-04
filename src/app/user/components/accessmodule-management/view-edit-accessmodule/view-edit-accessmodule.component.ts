import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  OnChanges,
  OnInit,
  SimpleChanges,
  EventEmitter,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  accessModuleResponse,
  accessModuleRequest,
} from '../../../models/AccessModule';
import { roleResponse } from '../../../models/Role';
import { AlertService } from '../../../../template/services/alert/alert.service';
import { RoleService } from '../../../services/role/role.service';
import { AccessModuleService } from '../../../services/access-module/access-module.service';

@Component({
  selector: 'app-view-edit-accessmodule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [],
  templateUrl: './view-edit-accessmodule.component.html',
  styleUrl: './view-edit-accessmodule.component.css',
})
export class ViewEditAccessmoduleComponent implements OnInit, OnChanges {
  @Input() isEdit: boolean = false;
  @Input() isAdmin: boolean = false;

  @Input() accessModule?: accessModuleResponse;

  @Output() popupForm = new EventEmitter<void>();
  @Output() moduleSaved = new EventEmitter<accessModuleResponse>();

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
    this.initializeModuleData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accessModule'] && this.accessModule) {
      this.initializeModuleData();
    }

    if (!this.isEdit) {
      this.accessModuleForm.disable();
    }
  }

  initializeServices(): void {
    // role services
    this._roleService.getAll().subscribe({
      next: (res) => {
        if (res) {
          this.allRoles = res.sort((a: roleResponse, b: roleResponse) => {
            return a.title.localeCompare(b.title);
          });
          this.sortRolesWithSelectedOnTop();
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

  initializeModuleData() {
    if (this.accessModule) {
      this.selectedRoleIds = this.accessModule.roles?.map((r) => r.id!) ?? [];

      this.accessModuleForm.patchValue({
        name: this.accessModule.name,
        roles: this.selectedRoleIds,
      });
    }
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

  save(module: accessModuleResponse) {
    // check validity
    if (this.accessModuleForm.invalid) {
      const invalidControls = this.getInvalidControls(this.accessModuleForm);
      this._alertService.displayAlert('Please fill in all required fields');
      return;
    }

    // create object
    if (this.accessModuleForm.valid) {
      const formValues = this.accessModuleForm.value;
      const request: accessModuleRequest = {
        name: formValues.name,
        roleIds: formValues.roles,
      };

      const updatedModule = this.updateModule(module.id, request);

      if (updatedModule) {
        this.moduleSaved.emit(module);
      }

      this.close();
    }
  }

  updateModule(id: string, request: accessModuleRequest): boolean {
    this._accessModuleService.update(id, request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully updating module');
          return true;
        }
        return false;
      },
      error: (err: any) => {
        console.error('Error updating module:', err);
        this._alertService.displayAlert('Failed to update module');
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

  deleteModule(module: accessModuleResponse) {
    const proceed = confirm(
      `Are you sure you want to delete this module - ${module.name} - permanently`
    );

    if (proceed) {
      this._accessModuleService.delete(module.id).subscribe({
        next: (res: boolean) => {
          if (res) {
            this._alertService.displayAlert('Successfully deleting module');
            this.close();
          }
        },
        error: (err: any) => {
          console.error('Error deleting module:', err);
          this._alertService.displayAlert('Failed to delete module');
        },
      });
    }
  }

  close() {
    this.popupForm.emit();
  }
}
