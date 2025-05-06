import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  EventEmitter,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { roleRequest, roleResponse } from '../../../models/Role';
import { AccessModuleService } from '../../../services/access-module/access-module.service';
import { AlertService } from '../../../../template/services/alert/alert.service';
import { RoleService } from '../../../services/role/role.service';
import { accessModuleResponse } from '../../../models/AccessModule';

@Component({
  selector: 'app-view-edit-role',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-edit-role.component.html',
  styleUrl: './view-edit-role.component.css',
})
export class ViewEditRoleComponent implements OnInit, OnChanges {
  @Input() isEdit: boolean = false;
  @Input() isAdmin: boolean = false;

  @Input() role?: roleResponse;

  @Output() popupForm = new EventEmitter<void>();
  @Output() moduleSaved = new EventEmitter<roleResponse>();

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
    this.initializeModuleData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['role'] && this.role) {
      this.initializeModuleData();
    }

    if (!this.isEdit) {
      this.roleForm.disable();
    }
  }

  initializeServices(): void {
    // role services
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
        this._alertService.displayAlert('Failed to get all modules');
      },
    });
  }

  initializeForm() {
    this.roleForm = this.fb.group({
      title: ['', Validators.required],
      accessModules: [[], Validators.required],
    });
  }

  initializeModuleData() {
    if (this.role) {
      this.selectedAccessModuleIds =
        this.role.accessModules?.map((am) => am.id!) ?? [];

      this.roleForm.patchValue({
        title: this.role.title,
        accessModules: this.selectedAccessModuleIds,
      });
    }
  }

  isAccessModuleSelected(accessModuleId: string): boolean {
    return this.selectedAccessModuleIds.includes(accessModuleId);
  }

  save(role: roleResponse) {
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

      const updatedRole = this.updateRole(role.id!, request);

      if (updatedRole) {
        this.moduleSaved.emit(role);
      }

      this.close();
    }
  }

  updateRole(id: string, request: roleRequest): boolean {
    this._roleService.update(id, request).subscribe({
      next: (res: boolean) => {
        if (res) {
          this._alertService.displayAlert('Successfully updating role');
          return true;
        }
        return false;
      },
      error: (err: any) => {
        console.error('Error updating role:', err);
        this._alertService.displayAlert('Failed to update role');
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

  deleteRole(role: roleResponse) {
    const proceed = confirm(
      `Are you sure you want to delete this role - ${role.title} - permanently`
    );

    if (proceed) {
      this._roleService.delete(role.id!).subscribe({
        next: (res: boolean) => {
          if (res) {
            this._alertService.displayAlert('Successfully deleting role');
            this.close();
          }
        },
        error: (err: any) => {
          console.error('Error deleting role:', err);
          this._alertService.displayAlert('Failed to delete role');
        },
      });
    }
  }

  close() {
    this.popupForm.emit();
  }
}
