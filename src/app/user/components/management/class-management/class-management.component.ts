import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddClassComponent } from './add-class/add-class.component';
import { ViewEditClassComponent } from './view-edit-class/view-edit-class.component';
import { StorageService } from '../../../../template/services/storage/storage.service';
import { AlertService } from '../../../../template/services/alert/alert.service';
import { ClassCategoryService } from '../../../services/class-category/class-category.service';
import { KeyConstant } from '../../../../template/helper/local-storage/key-constant';
import { userResponse } from '../../../models/User';
import { classCategoryResponse } from '../../../models/ClassCategory';
import { BatchService } from '../../../services/batch/batch.service';
import { ClassRankService } from '../../../services/class-rank/class-rank.service';
import { ClassStreamService } from '../../../services/class-stream/class-stream.service';
import { batchResponse } from '../../../models/Batch';
import { classStreamResponse } from '../../../models/ClassStream';
import { classRankResponse } from '../../../models/ClassRank';

@Component({
  selector: 'app-class-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddClassComponent,
    ViewEditClassComponent,
  ],
  providers: [StorageService, AlertService, ClassCategoryService],
  templateUrl: './class-management.component.html',
  styleUrl: './class-management.component.css',
})
export class ClassManagementComponent implements OnInit {
  adminIdentity: userResponse | undefined;
  allCategories: classCategoryResponse[] = [];
  classBatches: batchResponse[] = [];
  classStreams: classStreamResponse[] = [];
  classRanks: classRankResponse[] = [];
  selectedCategory?: classCategoryResponse;

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
    private _classService: ClassCategoryService,
    private _batchService: BatchService,
    private _rankService: ClassRankService,
    private _streamService: ClassStreamService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
    this.loadClassCategories();
    this.loadBatches();
    this.loadStreams();
    this.loadRanks();
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

  loadClassCategories() {
    this._classService.getAll().subscribe({
      next: (res: classCategoryResponse[]) => {
        if (res) {
          this.allCategories = res;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load class categories list');
      },
    });
  }

  loadBatches() {
    this._batchService.getAll(true).subscribe({
      next: (res: batchResponse[]) => {
        if (res) {
          this.classBatches = res;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load batch list');
      },
    });
  }

  loadStreams() {
    this._streamService.getAll(true).subscribe({
      next: (res: classStreamResponse[]) => {
        if (res) {
          this.classStreams = res;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load stream list');
      },
    });
  }

  loadRanks() {
    this._rankService.getAll(true).subscribe({
      next: (res: classRankResponse[]) => {
        if (res) {
          this.classRanks = res;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load rank list');
      },
    });
  }

  getBatch(batchId: string) {
    return this.classBatches.find((b) => b.id === batchId)?.name;
  }

  getStream(streamId: string) {
    return this.classStreams.find((s) => s.id === streamId)?.name;
  }

  getRank(rankId: string) {
    return this.classRanks.find((r) => r.id === rankId)?.name;
  }

  //#region popup
  viewCategory(category: classCategoryResponse) {
    this.isEdit = false;
    this.showViewEditPopup = true;
    this.selectedCategory = category;
  }

  editCategory(category: classCategoryResponse) {
    this.isEdit = true;
    this.showViewEditPopup = true;
    this.selectedCategory = category;
  }

  addCategory() {
    this.showAddPopup = true;
  }

  closePopupForm() {
    this.showAddPopup = false;
    this.showViewEditPopup = false;
    this.selectedCategory = undefined;
  }
  //#endregion

  //#region pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.allCategories.length / this.itemsPerPage);
    this.allCategories = this.allCategories.slice(
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
      this.allCategories.length
    );
  }
  //#endregion
}
