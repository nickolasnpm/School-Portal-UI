import { studentResponse } from './Student';
import { teacherResponse } from './Teacher';

export interface userAddRequest {
  registerForRole: string;
  fullName: string;
  emailAddress: string;
  mobileNumber: string;
  dateOfBirth: Date;
  gender: string;

  // Teacher properties
  serviceStatus?: string;
  isAvailable?: boolean;

  // Student properties
  entranceYear?: number;
  estimatedExitYear?: number;

  classCategoryId?: string;
  classSubjectIds?: string[];
}

export interface userUpdateRequest {
  updateForRole: string;
  id: string;
  fullName: string;
  emailAddress: string;
  mobileNumber: string;
  dateOfBirth: Date;
  gender: string;
  isActive: boolean;

  // Teacher properties
  serviceStatus?: string;
  isAvailable?: boolean;
  responsibilityType?: string;
  responsibilityFocus?: string;

  // Student properties
  entranceYear?: number;
  estimatedExitYear?: number;
  realExitYear?: number;
  exitReason?: string;

  classCategoryId?: string;
  classSubjectIds?: string[];
}

export interface userResponse {
  id: string;
  serialTag: string;
  fullName: string;
  emailAddress: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: string;
  age: number;
  profilePictureUri?: string;
  isActive: boolean;
  isConfirmedEmail: boolean;
  isChangedPassword: boolean;
  roles: string[];
  student?: studentResponse;
  teacher?: teacherResponse;
}

export interface userListRequest {
  pageNumber: number;
  pageSize: number;
  roleTitle: string;
  isActive: boolean;
}

export interface userListResponse {
  totalUsers: number;
  returnedUsers: number;
  paginationList: userResponse[];
}

export interface loginRequest {
  emailAddress: string;
  password: string;
}

export interface loginResponse {
  id: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiration: string;
}

export interface userVerifyAccount {
  emailAddress: string;
  mobileNumber: string;
  verificationNumber: string;
}

export interface userChangePassword {
  emailAddress: string;
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface userResetPasssword {
  emailAddress: string;
}

export interface reInviteUser {
  emailAddress: string;
}
