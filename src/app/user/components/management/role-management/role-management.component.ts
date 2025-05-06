import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddRoleComponent } from './add-role/add-role.component';
import { ViewEditRoleComponent } from './view-edit-role/view-edit-role.component';
import { StorageService } from '../../../../template/services/storage/storage.service';
import { AlertService } from '../../../../template/services/alert/alert.service';
import { UserService } from '../../../services/user/user.service';
import { RoleService } from '../../../services/role/role.service';
import { userResponse } from '../../../models/User';
import { roleResponse } from '../../../models/Role';
import { KeyConstant } from '../../../../template/helper/local-storage/key-constant';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AddRoleComponent, ViewEditRoleComponent],
  providers: [StorageService, AlertService, UserService, RoleService],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.css',
})
export class RoleManagementComponent implements OnInit {
  adminIdentity: userResponse | undefined;
  allRoles: roleResponse[] = [];
  selectedRole?: roleResponse;

  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPageOptions: number[] = [20, 50, 100];
  itemsPerPage: number = this.itemsPerPageOptions[0];

  showAddPopup: boolean = false;
  showViewEditPopup: boolean = false;

  isEdit: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private _alertService: AlertService,
    private _storageService: StorageService,
    private _roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
    this.loadRoles();
  }

  loadUserDetails() {
    const jsonResult = this._storageService.getItem(KeyConstant.USER_RESPONSE);

    if (jsonResult) {
      this.adminIdentity = JSON.parse(jsonResult);
      if (this.adminIdentity && this.adminIdentity.roles.includes('Admin')) {
        this.isAdmin = true;
      }
    }
  }

  loadRoles() {
    this._roleService.getAll().subscribe({
      next: (res: roleResponse[]) => {
        if (res) {
          this.allRoles = res;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load role list');
      },
    });
  }

  //#region popup
  viewRole(role: roleResponse) {
    this.isEdit = false;
    this.showViewEditPopup = true;
    this.selectedRole = role;
  }

  editRole(role: roleResponse) {
    this.isEdit = true;
    this.showViewEditPopup = true;
    this.selectedRole = role;
  }

  addRole() {
    this.showAddPopup = true;
  }

  closePopupForm() {
    this.showAddPopup = false;
    this.showViewEditPopup = false;
    this.selectedRole = undefined;
  }
  //#endregion

  //#region pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.allRoles.length / this.itemsPerPage);
    this.allRoles = this.allRoles.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  changeItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = Number(target.value);
    this.currentPage = 1;
    this.updatePagination();
  }

  getTotalPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getStartItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.allRoles.length);
  }
  //#endregion
}
