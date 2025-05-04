import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../../template/services/storage/storage.service';
import { AlertService } from '../../../template/services/alert/alert.service';
import { UserService } from '../../services/user/user.service';
import { AccessModuleService } from '../../services/access-module/access-module.service';
import { accessModuleResponse } from '../../models/AccessModule';
import { userResponse } from '../../models/User';
import { AddAccessmoduleComponent } from './add-accessmodule/add-accessmodule.component';
import { ViewEditAccessmoduleComponent } from './view-edit-accessmodule/view-edit-accessmodule.component';
import { KeyConstant } from '../../../template/helper/local-storage/key-constant';

@Component({
  selector: 'app-accessmodule-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddAccessmoduleComponent,
    ViewEditAccessmoduleComponent,
  ],
  providers: [StorageService, AlertService, UserService, AccessModuleService],
  templateUrl: './accessmodule-management.component.html',
  styleUrl: './accessmodule-management.component.css',
})
export class AccessmoduleManagementComponent implements OnInit {
  adminIdentity: userResponse | undefined;
  allAccessModules: accessModuleResponse[] = [];
  selectedAccessModule?: accessModuleResponse;

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
    private _accessModuleService: AccessModuleService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
    this.loadAccessModules();
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

  loadAccessModules() {
    this._accessModuleService.getAll().subscribe({
      next: (res: accessModuleResponse[]) => {
        if (res) {
          this.allAccessModules = res;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load access module list');
      },
    });
  }

  //#region popup
  viewModule(module: accessModuleResponse) {
    this.isEdit = false;
    this.showViewEditPopup = true;
    this.selectedAccessModule = module;
  }

  editModule(module: accessModuleResponse) {
    this.isEdit = true;
    this.showViewEditPopup = true;
    this.selectedAccessModule = module;
  }

  addModule() {
    this.showAddPopup = true;
  }

  closePopupForm() {
    this.showAddPopup = false;
    this.showViewEditPopup = false;
    this.selectedAccessModule = undefined;
  }
  //#endregion

  //#region pagination
  updatePagination() {
    this.totalPages = Math.ceil(
      this.allAccessModules.length / this.itemsPerPage
    );
    this.allAccessModules = this.allAccessModules.slice(
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
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.allAccessModules.length
    );
  }
  //#endregion
}
