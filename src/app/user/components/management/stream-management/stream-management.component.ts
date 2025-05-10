import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddStreamComponent } from './add-stream/add-stream.component';
import { ViewEditStreamComponent } from './view-edit-stream/view-edit-stream.component';
import { ClassStreamService } from '../../../services/class-stream/class-stream.service';
import { UserService } from '../../../services/user/user.service';
import { AlertService } from '../../../../template/services/alert/alert.service';
import { StorageService } from '../../../../template/services/storage/storage.service';
import { userResponse } from '../../../models/User';
import { classStreamResponse } from '../../../models/ClassStream';
import { KeyConstant } from '../../../../template/helper/local-storage/key-constant';

@Component({
  selector: 'app-stream-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddStreamComponent,
    ViewEditStreamComponent,
  ],
  providers: [StorageService, AlertService, UserService, ClassStreamService],
  templateUrl: './stream-management.component.html',
  styleUrl: './stream-management.component.css',
})
export class StreamManagementComponent implements OnInit {
  adminIdentity: userResponse | undefined;
  allStreams: classStreamResponse[] = [];
  selectedStream?: classStreamResponse;

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
    private _streamService: ClassStreamService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
    this.loadClassStreams();
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

  loadClassStreams() {
    this._streamService.getAll(true).subscribe({
      next: (res: classStreamResponse[]) => {
        if (res) {
          this.allStreams = res;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load class stream list');
      },
    });
  }

  //#region popup
  viewStream(batch: classStreamResponse) {
    this.isEdit = false;
    this.showViewEditPopup = true;
    this.selectedStream = batch;
  }

  editStream(batch: classStreamResponse) {
    this.isEdit = true;
    this.showViewEditPopup = true;
    this.selectedStream = batch;
  }

  addStream() {
    this.showAddPopup = true;
  }

  closePopupForm() {
    this.showAddPopup = false;
    this.showViewEditPopup = false;
    this.selectedStream = undefined;
  }
  //#endregion

  //#region pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.allStreams.length / this.itemsPerPage);
    this.allStreams = this.allStreams.slice(
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
      this.allStreams.length
    );
  }
  //#endregion
}
