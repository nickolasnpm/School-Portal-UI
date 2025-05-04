import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import {
  userResponse,
  userListRequest,
  userListResponse,
  userVerifyAccount,
  userChangePassword,
  userResetPasssword,
  userUpdateRequest,
} from '../../models/User';
import { AuthService } from '../auth/auth.service';
import { HttpService } from '../../../template/services/http/http.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/User`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService,
    private _authService: AuthService
  ) {}

  getAllUsers(request: userListRequest | null): Observable<userListResponse> {
    let params = new HttpParams();
    const apiUrl = `${this.controllerUrl}`;

    if (request) {
      params = this._httpService.appendParamsIfDefined(
        params,
        'pageNumber',
        request.pageNumber
      );
      params = this._httpService.appendParamsIfDefined(
        params,
        'pageSize',
        request.pageSize
      );
      params = this._httpService.appendParamsIfDefined(
        params,
        'roleTitle',
        request.roleTitle
      );
      params = params.append('isActive', request.isActive);
    }

    return this._httpClient
      .get<userListResponse>(apiUrl, {
        params,
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetAll Users', error)
        )
      );
  }

  getUserById(Id: string): Observable<userResponse> {
    const apiUrl = `${this.controllerUrl}/${Id}`;

    return this._httpClient
      .get<userResponse>(apiUrl, { headers: this._authService.getHeaders() })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetUser By Id', error)
        )
      );
  }

  verifyAccount(verifyAccount: userVerifyAccount): Observable<userResponse> {
    const apiUrl = `${this.controllerUrl}/VerifyAccount`;

    return this._httpClient
      .put<userResponse>(apiUrl, verifyAccount, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Verify Account', error)
        )
      );
  }

  changePassword(changePassword: userChangePassword): Observable<userResponse> {
    const apiUrl = `${this.controllerUrl}/ChangePassword`;
    return this._httpClient
      .put<userResponse>(apiUrl, changePassword, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Change Password', error)
        )
      );
  }

  resetPassword(resetPassword: userResetPasssword): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}/ResetPassword`;
    return this._httpClient
      .put<boolean>(apiUrl, resetPassword, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Reset Password', error)
        )
      );
  }

  updateUser(
    Id: string,
    userUpdateRequest: userUpdateRequest
  ): Observable<userResponse> {
    const apiUrl = `${this.controllerUrl}/${Id}`;
    return this._httpClient
      .put<userResponse>(apiUrl, userUpdateRequest, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Update User', error)
        )
      );
  }

  deleteUser(Id: string): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}/${Id}`;
    return this._httpClient
      .delete<boolean>(apiUrl, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Delete User', error)
        )
      );
  }
}
