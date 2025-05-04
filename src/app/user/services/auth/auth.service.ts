import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { KeyConstant } from '../../../template/helper/local-storage/key-constant';
import { StorageService } from '../../../template/services/storage/storage.service';
import { loginRequest, loginResponse } from '../../models/User';
import { AlertService } from '../../../template/services/alert/alert.service';
import { HttpService } from '../../../template/services/http/http.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/Auth`;

  constructor(
    private _router: Router,
    private _httpClient: HttpClient,
    private _httpService: HttpService,
    private _storageService: StorageService,
    private _alertService: AlertService
  ) {}

  public getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Disable-SSL': 'true',
      Authorization: `Bearer ${this.getAccessToken()}`,
    });
  }

  public getLoginToken(): loginResponse | undefined {
    let token = this._storageService.getItem(KeyConstant.AUTH_TOKEN);
    let response: loginResponse | undefined;

    if (token) {
      response = JSON.parse(token);

      if (!response) {
        return undefined;
      }

      if (response?.tokenExpiration) {
        const isValidToken = this.checkTokenValidity(response.tokenExpiration);

        if (!isValidToken) {
          return undefined;
        }
      }
    }

    return response;
  }

  public getAccessToken(): string | undefined {
    const response = this.getLoginToken();

    if (response?.accessToken) {
      return response?.accessToken;
    }

    return '';
  }

  public getUserId(): string | undefined {
    const response = this.getLoginToken();

    if (response?.id) {
      return response?.id;
    }

    return '';
  }

  public checkTokenValidity(tokenExpiration: string): boolean {
    const expirationDate = new Date(tokenExpiration);
    const currentDate = new Date();

    if (expirationDate.getTime() <= currentDate.getTime()) {
      this._alertService.displayAlert('Session expired. Please log in again.');
      this._storageService.clearItems();
      this._router.navigate(['/user/login']);
    }

    return true;
  }

  public loginUser(request: loginRequest): Observable<loginResponse> {
    const apiUrl = `${this.controllerUrl}/Login`;
    return this._httpClient
      .post<loginResponse>(`${apiUrl}`, request, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => this._httpService.handleError('LoginUser', error))
      );
  }

  public logoutUser(userId: string): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}/Logout?Id=${userId}`;
    return this._httpClient
      .post<boolean>(`${apiUrl}`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('LogoutUser', error)
        )
      );
  }
}
