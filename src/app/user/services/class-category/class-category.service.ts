import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import {
  classCategoryResponse,
  classCategoryRequest,
} from '../../models/ClassCategory';
import { HttpService } from '../../../template/services/http/http.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ClassCategoryService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/ClassCategory`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService,
    private _authService: AuthService
  ) {}

  getAll(): Observable<classCategoryResponse[]> {
    const apiUrl = `${this.controllerUrl}`;

    return this._httpClient
      .get<classCategoryResponse[]>(apiUrl, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetAllClassCategories', error)
        )
      );
  }

  create(request: classCategoryRequest): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}`;
    return this._httpClient
      .post<boolean>(`${apiUrl}`, request, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Create Category', error)
        )
      );
  }

  update(id: string, request: classCategoryRequest): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}/${id}`;
    return this._httpClient
      .put<boolean>(`${apiUrl}`, request, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Update Category', error)
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
          this._httpService.handleError('Delete Category', error)
        )
      );
  }
}
