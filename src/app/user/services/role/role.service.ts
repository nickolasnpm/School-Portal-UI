import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { roleRequest, roleResponse } from '../../models/Role';
import { AuthService } from '../auth/auth.service';
import { HttpService } from '../../../template/services/http/http.service';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/Role`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService,
    private _authService: AuthService
  ) {}

  getAll(): Observable<roleResponse[]> {
    const apiUrl = `${this.controllerUrl}`;

    return this._httpClient
      .get<roleResponse[]>(`${apiUrl}`, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetAllRoles', error)
        )
      );
  }

    create(request: roleRequest): Observable<boolean> {
      const apiUrl = `${this.controllerUrl}`;
      return this._httpClient
        .post<boolean>(`${apiUrl}`, request, {
          headers: this._authService.getHeaders(),
        })
        .pipe(
          catchError((error) =>
            this._httpService.handleError('Create Role', error)
          )
        );
    }
  
    update(id: string, request: roleRequest): Observable<boolean> {
      const apiUrl = `${this.controllerUrl}/${id}`;
      return this._httpClient
        .put<boolean>(`${apiUrl}`, request, {
          headers: this._authService.getHeaders(),
        })
        .pipe(
          catchError((error) =>
            this._httpService.handleError('Update Role', error)
          )
        );
    }
  
    delete(id: string): Observable<boolean> {
      const apiUrl = `${this.controllerUrl}/${id}`;
      return this._httpClient
        .delete<boolean>(`${apiUrl}`, {
          headers: this._authService.getHeaders(),
        })
        .pipe(
          catchError((error) =>
            this._httpService.handleError('Delete Role', error)
          )
        );
    }
}
