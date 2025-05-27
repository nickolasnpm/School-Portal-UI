import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddSubjectComponent } from './add-subject/add-subject.component';
import { ViewEditSubjectComponent } from './view-edit-subject/view-edit-subject.component';
import { StorageService } from '../../../../template/services/storage/storage.service';
import { AlertService } from '../../../../template/services/alert/alert.service';
import { UserService } from '../../../services/user/user.service';
import { SubjectService } from '../../../services/subject/subject.service';
import { subjectResponse } from '../../../models/Subject';
import {
  userListRequest,
  userListResponse,
  userResponse,
} from '../../../models/User';
import { KeyConstant } from '../../../../template/helper/local-storage/key-constant';

@Component({
  selector: 'app-subject-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddSubjectComponent,
    ViewEditSubjectComponent,
  ],
  providers: [StorageService, AlertService, UserService, SubjectService],
  templateUrl: './subject-management.component.html',
  styleUrl: './subject-management.component.css',
})
export class SubjectManagementComponent implements OnInit {
  adminIdentity: userResponse | undefined;
  allSubjects: subjectResponse[] = [];
  selectedSubject?: subjectResponse;
  allTeachers: userResponse[] = [];

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
    private _userService: UserService,
    private _subjectServicee: SubjectService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
    this.loadSubjects();
    this.loadAllTeachers();
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

  loadSubjects() {
    this._subjectServicee.getAll().subscribe({
      next: (res: subjectResponse[]) => {
        if (res) {
          this.allSubjects = res;
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to load subject list');
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
  viewSubject(subject: subjectResponse) {
    this.isEdit = false;
    this.showViewEditPopup = true;
    this.selectedSubject = subject;
  }

  editSubject(subject: subjectResponse) {
    this.isEdit = true;
    this.showViewEditPopup = true;
    this.selectedSubject = subject;
  }

  addSubject() {
    this.showAddPopup = true;
  }

  closePopupForm() {
    this.showAddPopup = false;
    this.showViewEditPopup = false;
    this.selectedSubject = undefined;
  }
  //#endregion

  //#region pagination
  updatePagination() {
    this.totalPages = Math.ceil(this.allSubjects.length / this.itemsPerPage);
    this.allSubjects = this.allSubjects.slice(
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
      this.allSubjects.length
    );
  }
  //#endregion
}
