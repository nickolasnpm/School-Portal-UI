import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import {
  accessModuleRequest,
  accessModuleResponse,
} from '../../models/AccessModule';
import { HttpService } from '../../../template/services/http/http.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AccessModuleService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/AccessModule`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService,
    private _authService: AuthService
  ) {}

  getAll(): Observable<accessModuleResponse[]> {
    const apiUrl = `${this.controllerUrl}`;
    return this._httpClient
      .get<accessModuleResponse[]>(`${apiUrl}`, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetAll Access Module', error)
        )
      );
  }

  create(request: accessModuleRequest): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}`;
    return this._httpClient
      .post<boolean>(`${apiUrl}`, request, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Create Access Module', error)
        )
      );
  }

  update(id: string, request: accessModuleRequest): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}/${id}`;
    return this._httpClient
      .put<boolean>(`${apiUrl}`, request, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Update Access Module', error)
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
          this._httpService.handleError('Delete Access Module', error)
        )
      );
  }
}
