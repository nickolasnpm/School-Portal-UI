import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddBatchComponent } from './add-batch/add-batch.component';
import { ViewEditBatchComponent } from './view-edit-batch/view-edit-batch.component';
import { StorageService } from '../../../template/services/storage/storage.service';
import { AlertService } from '../../../template/services/alert/alert.service';
import { UserService } from '../../services/user/user.service';
import { BatchService } from '../../services/batch/batch.service';
import {
  userListRequest,
  userListResponse,
  userResponse,
} from '../../models/User';
import { batchResponse } from '../../models/Batch';
import { KeyConstant } from '../../../template/helper/local-storage/key-constant';

@Component({
  selector: 'app-batch-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddBatchComponent,
    ViewEditBatchComponent,
  ],
  providers: [StorageService, AlertService, UserService, BatchService],
  templateUrl: './batch-management.component.html',
  styleUrl: './batch-management.component.css',
})
export class BatchManagementComponent implements OnInit {
  adminIdentity: userResponse | undefined;
  allBatches: batchResponse[] = [];
  selectedBatch?: batchResponse;

  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPageOptions: number[] = [20, 50, 100];
  itemsPerPage: number = this.itemsPerPageOptions[0];

  showAddPopup: boolean = false;
  showViewEditPopup: boolean = false;

  isEdit: boolean = false;
  isAdmin: boolean = false;

  allTeachers: userResponse[] = [];

  constructor(
    private _alertService: AlertService,
    private _storageService: StorageService,
    private _batchService: BatchService,
    private _userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
    this.loadBatches();
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

  loadBatches() {
    this._batchService.getAll(true).subscribe({
      next: (res: batchResponse[]) => {
        if (res) {
          this.allBatches = res;
          this.loadAllTeachers();
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load batch list');
      },
    });
  }

  loadAllTeachers() {
    const listRequest: userListRequest = {
      pageNumber: 0,
      pageSize: 0,
      roleTitle: 'teacher',
      isActive: false,
    };

    this._userService.getAllUsers(listRequest).subscribe({
      next: (result: userListResponse) => {
        if (result) {
          this.allTeachers = result.paginationList;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load user list');
      },
    });
  }

  loadTeacher(teacherId?: string): string {
    let teacherName: string = '';

    if (teacherId) {
      const teacher = this.allTeachers.find(
        (at) => at.teacher?.id == teacherId
      );
      teacherName = teacher?.fullName!;
    }

    return teacherName ? teacherName : '-';
  }

  //#region popup
  viewBatch(batch: batchResponse) {
    this.isEdit = false;
    this.showViewEditPopup = true;
    this.selectedBatch = batch;
  }

  editBatch(batch: batchResponse) {
    this.isEdit = true;
    this.showViewEditPopup = true;
    this.selectedBatch = batch;
  }

  addBatch() {
    this.showAddPopup = true;
  }

  closePopupForm() {
    this.showAddPopup = false;
    this.showViewEditPopup = false;
    this.selectedBatch = undefined;
  }
  //#endregion

  //#region pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.allBatches.length / this.itemsPerPage);
    this.allBatches = this.allBatches.slice(
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
      this.allBatches.length
    );
  }
  //#endregion
}
