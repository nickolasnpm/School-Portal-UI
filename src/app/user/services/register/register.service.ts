import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { reInviteUser, userAddRequest, userResponse } from '../../models/User';
import { AuthService } from '../auth/auth.service';
import { HttpService } from '../../../template/services/http/http.service';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/Register`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService,
    private _authService: AuthService
  ) {}

  registerUser(request: userAddRequest): Observable<userResponse> {
    return this._httpClient
      .post<userResponse>(`${this.controllerUrl}`, request, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('RegisterUser', error)
        )
      );
  }

  reInviteUser(reinviteUser: reInviteUser): Observable<boolean> {
    return this._httpClient
      .put<boolean>(`${this.controllerUrl}`, reinviteUser, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('ReinvitedUser', error)
        )
      );
  }
}
