import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { classRankRequest, classRankResponse } from '../../models/ClassRank';
import { HttpService } from '../../../template/services/http/http.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ClassRankService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/ClassRank`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService,
    private _authService: AuthService
  ) {}

  getAll(isActive: boolean): Observable<classRankResponse[]> {
    const apiUrl = `${this.controllerUrl}`;

    let params = new HttpParams();
    params = params.append('isActive', isActive);

    return this._httpClient
      .get<classRankResponse[]>(apiUrl, {
        headers: this._authService.getHeaders(),
        params,
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetAllClassRanks', error)
        )
      );
  }

  create(request: classRankRequest): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}`;
    return this._httpClient
      .post<boolean>(`${apiUrl}`, request, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Create Rank', error)
        )
      );
  }

  update(id: string, request: classRankRequest): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}/${id}`;
    return this._httpClient
      .put<boolean>(`${apiUrl}`, request, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Update Rank', error)
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
          this._httpService.handleError('Delete Rank', error)
        )
      );
  }
}
