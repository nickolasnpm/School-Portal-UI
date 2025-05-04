import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { userListResponse, userResponse } from '../../models/User';
import { roleResponse } from '../../models/Role';
import { teacherResponse } from '../../models/Teacher';
import { classCategoryResponse } from '../../models/ClassCategory';
import { classSubjectResponse } from '../../models/ClassSubject';
import { StorageService } from '../../../template/services/storage/storage.service';
import { AlertService } from '../../../template/services/alert/alert.service';
import { UserService } from '../../services/user/user.service';
import { RoleService } from '../../services/role/role.service';
import { ClassCategoryService } from '../../services/class-category/class-category.service';
import { ViewEditUserComponent } from './view-edit/view-edit-user.component';
import { KeyConstant } from '../../../template/helper/local-storage/key-constant';
import { RegisterComponent } from './register/register.component';

interface Filter {
  fullName: string;
  emailAddress: string;
  role: string;
  class: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewEditUserComponent, RegisterComponent],
  providers: [StorageService, AlertService, UserService],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit {
  adminIdentity: userResponse | undefined;
  users: userResponse[] = [];
  filteredUsers: userResponse[] = [];
  paginatedUsers: userResponse[] = [];

  filters: Filter = {
    fullName: '',
    emailAddress: '',
    role: 'Student',
    class: '',
  };

  availableRoles: roleResponse[] = [];
  availableClasses: classCategoryResponse[] = [];
  availableSubjects: classSubjectResponse[] = [];

  currentPage: number = 1;
  totalPages: number = 1;

  itemsPerPageOptions: number[] = [20, 50, 100];
  itemsPerPage: number = this.itemsPerPageOptions[0];

  showViewEditPopup = false;
  showRegisterPopup = false;

  isEditMode = false;
  isfromUserProfile = false;
  isAdmin = false;
  isTeacher = false;
  selectedUser?: userResponse;

  teacherList: teacherResponse[] = [];

  constructor(
    private _storageService: StorageService,
    private _alertService: AlertService,
    private _userService: UserService,
    private _roleService: RoleService,
    private _classCategoryService: ClassCategoryService
  ) {}

  ngOnInit() {
    this.loadUserDetails();
    this.loadUsers();
    this.loadRoles();
    this.loadClassCategories();
  }

  loadUserDetails() {
    const jsonResult = this._storageService.getItem(KeyConstant.USER_RESPONSE);

    if (jsonResult) {
      this.adminIdentity = JSON.parse(jsonResult);

      if (this.adminIdentity!.roles.includes('Admin')) {
        this.isAdmin = true;
      } else if (this.adminIdentity!.roles.includes('Teacher')) {
        this.isTeacher = true;
      }
    }
  }

  loadUsers() {
    if (this.isAdmin || this.isTeacher) {
      this._userService.getAllUsers(null).subscribe({
        next: (result: userListResponse) => {
          if (result && result.paginationList) {
            let userLists: userResponse[] = result.paginationList;
            if (this.isTeacher) {
              userLists = this.applyTeacherFilter(userLists);
            }
            this.users = userLists;
            this.applyDefaultStudentFilter();
          }
        },
        error: (err) => {
          console.error(err.error);
          this._alertService.displayAlert('Failed to load user list');
        },
      });
    }
  }

  applyTeacherFilter(users: userResponse[]): userResponse[] | [] {
    let filteredUsers = users;
    filteredUsers = this.filterBasedOnStudentBatch(filteredUsers);
    filteredUsers = this.filterBasedOnSubject(filteredUsers);
    filteredUsers = this.filterBasedOnClassCategoryId(filteredUsers);
    filteredUsers = this.filterOutAdmin(filteredUsers);
    return filteredUsers;
  }

  applyDefaultStudentFilter() {
    this.filteredUsers = this.users.filter((user) =>
      user.roles.includes('Student')
    );
    this.updatePagination();
  }

  filterOutAdmin(users: userResponse[]): userResponse[] {
    return users.filter((user) => !user.roles.includes('Admin'));
  }

  filterBasedOnStudentBatch(users: userResponse[]): userResponse[] | [] {
    let batch: string = '0';

    if (this.adminIdentity?.teacher?.responsibilityType === 'Batch') {
      switch (
        this.adminIdentity.teacher.responsibilityFocus?.toLocaleLowerCase()
      ) {
        case 'first':
          batch = '1';
          break;
        case 'second':
          batch = '2';
          break;
        case 'third':
          batch = '3';
          break;
        case 'fourth':
          batch = '4';
          break;
        case 'fifth':
          batch = '5';
          break;
        case 'sixth':
          batch = '6';
          break;
        default:
          return users;
      }

      return users.filter((user) => {
        if (user.roles.includes('Student')) {
          const className = this.getClassName(user);

          if (className) {
            return className.includes(batch);
          }

          return false;
        }
        return true;
      });
    }
    return users;
  }

  filterBasedOnSubject(users: userResponse[]): userResponse[] {
    const teacherSubjectIds =
      this.adminIdentity?.teacher?.classSubjects?.map((cs) => cs.id) ?? [];

    if (teacherSubjectIds.length === 0) {
      return users;
    }

    return users.filter((user) => {
      const studentSubjectIds =
        user.student?.classSubjects?.map((cs) => cs.id) ?? [];
      return studentSubjectIds.some((subjectId) =>
        teacherSubjectIds.includes(subjectId)
      );
    });
  }

  filterBasedOnClassCategoryId(users: userResponse[]): userResponse[] | [] {
    if (this.adminIdentity?.teacher?.classCategoryId) {
      return users.filter(
        (user) =>
          user.student?.classCategoryId ==
          this.adminIdentity?.teacher?.classCategoryId
      );
    }
    return users;
  }

  loadRoles() {
    this._roleService.getAll().subscribe({
      next: (res) => {
        if (res) {
          this.availableRoles = res.sort((a, b) =>
            a.title.localeCompare(b.title)
          );
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to get all roles');
      },
    });
  }

  loadClassCategories() {
    this._classCategoryService.getAll().subscribe({
      next: (res) => {
        if (res) {
          this.availableClasses = res.sort((a, b) =>
            a.code.localeCompare(b.code)
          );
        }
      },
      error: (err) => {
        console.error(err.error);
        this._alertService.displayAlert('Failed to get all class categories');
      },
    });
  }

  getClassName(user: userResponse): string {
    let classCategoryId = '';

    if (user.student?.classCategoryId) {
      classCategoryId = user.student.classCategoryId;
    } else if (user.teacher?.classCategoryId) {
      classCategoryId = user.teacher.classCategoryId;
    }

    const classCategory = this.availableClasses.find(
      (cc) => cc.id == classCategoryId
    );

    return classCategory?.code || 'N/A';
  }

  getRoleColor(roleTitle: string): string {
    switch (roleTitle.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'teacher':
        return 'black';
      case 'student':
        return 'blue';
      default:
        return 'inherit';
    }
  }

  applyFilters() {
    // Start with the full user list
    let filtered = [...this.users];

    if (this.filters.fullName.trim()) {
      filtered = filtered.filter((user) =>
        user.fullName
          .toLowerCase()
          .includes(this.filters.fullName.toLowerCase())
      );
    }

    if (this.filters.emailAddress.trim()) {
      filtered = filtered.filter((user) =>
        user.emailAddress
          .toLowerCase()
          .includes(this.filters.emailAddress.toLowerCase())
      );
    }

    if (this.filters.role) {
      filtered = filtered.filter((user) =>
        user.roles.includes(this.filters.role)
      );
    }

    if (this.filters.class) {
      filtered = filtered.filter(
        (user) =>
          (user.student &&
            user.student.classCategoryId === this.filters.class) ||
          (user.teacher && user.teacher.classCategoryId === this.filters.class)
      );
    }

    // Update filtered users and reset pagination
    this.filteredUsers = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters() {
    this.filters = {
      fullName: '',
      emailAddress: '',
      role: 'Student',
      class: '',
    };
    this.applyDefaultStudentFilter();
    this.currentPage = 1;
  }

  registerUser() {
    this.showRegisterPopup = true;
  }

  viewUser(user: userResponse) {
    this.isEditMode = false;
    this.isfromUserProfile = false;
    this.selectedUser = user;
    this.showViewEditPopup = true;
  }

  editUser(user: userResponse) {
    if (this.isAllowedToMakeEdit(user)) {
      this.isEditMode = true;
      this.isfromUserProfile = false;
      this.selectedUser = user;
      this.showViewEditPopup = true;
    }
  }

  isAllowedToMakeEdit(user: userResponse): boolean {
    let isTheSamePerson: boolean = false;
    let isStudentOrTeacher: boolean = false;

    if (this.adminIdentity?.id === user.id) {
      isTheSamePerson = true;
    }

    if (user?.roles.includes('Teacher') || user.roles.includes('Student')) {
      isStudentOrTeacher = true;
    }

    if (
      !this.adminIdentity?.roles.includes('Admin') &&
      isStudentOrTeacher &&
      !isTheSamePerson
    ) {
      return false;
    } else {
      return true;
    }
  }

  handleUserSaved(user: userResponse) {
    this.loadUsers();
    this.showViewEditPopup = false;
  }
  
  closePopupForm() {
    this.showViewEditPopup = false;
    this.showRegisterPopup = false;
    this.selectedUser = undefined;
  }
  
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.paginatedUsers = this.filteredUsers.slice(
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
    this.currentPage = 1; // Reset to first page
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
      this.filteredUsers.length
    );
  }
}
