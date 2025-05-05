import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../../template/services/alert/alert.service';
import { StorageService } from '../../../template/services/storage/storage.service';
import { ClassRankService } from '../../services/class-rank/class-rank.service';
import { UserService } from '../../services/user/user.service';
import { userResponse } from '../../models/User';
import { classRankResponse } from '../../models/ClassRank';
import { KeyConstant } from '../../../template/helper/local-storage/key-constant';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddRankComponent } from './add-rank/add-rank.component';
import { ViewEditRankComponent } from './view-edit-rank/view-edit-rank.component';

@Component({
  selector: 'app-rank-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AddRankComponent, ViewEditRankComponent],
  providers: [StorageService, AlertService, UserService, ClassRankService],
  templateUrl: './rank-management.component.html',
  styleUrl: './rank-management.component.css',
})
export class RankManagementComponent implements OnInit {
  adminIdentity: userResponse | undefined;
  allRanks: classRankResponse[] = [];
  selectedRank?: classRankResponse;

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
    private _rankService: ClassRankService,
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
    this.loadClassRanks();
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

  loadClassRanks() {
    this._rankService.getAll(true).subscribe({
      next: (res: classRankResponse[]) => {
        if (res) {
          this.allRanks = res;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load class rank list');
      },
    });
  }

  //#region popup
  viewRank(batch: classRankResponse) {
    this.isEdit = false;
    this.showViewEditPopup = true;
    this.selectedRank = batch;
  }

  editRank(batch: classRankResponse) {
    this.isEdit = true;
    this.showViewEditPopup = true;
    this.selectedRank = batch;
  }

  addRank() {
    this.showAddPopup = true;
  }

  closePopupForm() {
    this.showAddPopup = false;
    this.showViewEditPopup = false;
    this.selectedRank = undefined;
  }
  //#endregion

  //#region pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.allRanks.length / this.itemsPerPage);
    this.allRanks = this.allRanks.slice(
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
    return Math.min(this.currentPage * this.itemsPerPage, this.allRanks.length);
  }
  //#endregion
}
