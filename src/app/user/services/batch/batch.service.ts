import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { batchRequest, batchResponse } from '../../models/Batch';
import { HttpService } from '../../../template/services/http/http.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BatchService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/Batch`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService,
    private _authService: AuthService
  ) {}

  getAll(isActive: boolean): Observable<batchResponse[]> {
    const apiUrl = `${this.controllerUrl}`;

    let params = new HttpParams();
    params = params.append('isActive', isActive);

    return this._httpClient
      .get<batchResponse[]>(apiUrl, {
        headers: this._authService.getHeaders(),
        params,
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetAllBatches', error)
        )
      );
  }

  getById(Id: string): Observable<batchResponse> {
    const apiUrl = `${this.controllerUrl}/${Id}`;

    return this._httpClient
      .get<batchResponse>(apiUrl, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) => this._httpService.handleError('GetById', error))
      );
  }

  create(request: batchRequest): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}`;
    return this._httpClient
      .post<boolean>(`${apiUrl}`, request, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Create Batch', error)
        )
      );
  }

  update(id: string, request: batchRequest): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}/${id}`;
    return this._httpClient
      .put<boolean>(`${apiUrl}`, request, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Update Batch', error)
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
          this._httpService.handleError('Delete Batch', error)
        )
      );
  }
}
