import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { subjectRequest, subjectResponse } from '../../models/Subject';
import { HttpService } from '../../../template/services/http/http.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/Subject`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService,
    private _authService: AuthService
  ) {}

  getAll(): Observable<subjectResponse[]> {
    const apiUrl = `${this.controllerUrl}`;
    return this._httpClient
      .get<subjectResponse[]>(`${apiUrl}`, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetAllSubjects', error)
        )
      );
  }

  getById(Id: string): Observable<subjectRequest> {
    const apiUrl = `${this.controllerUrl}/${Id}`;

    return this._httpClient
      .get<subjectResponse>(apiUrl, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) => this._httpService.handleError('GetById', error))
      );
  }

  create(request: subjectRequest): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}`;
    return this._httpClient
      .post<boolean>(`${apiUrl}`, request, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Create Subject', error)
        )
      );
  }

  update(id: string, request: subjectRequest): Observable<boolean> {
    const apiUrl = `${this.controllerUrl}/${id}`;
    return this._httpClient
      .put<boolean>(`${apiUrl}`, request, {
        headers: this._authService.getHeaders(),
      })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('Update Subject', error)
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
          this._httpService.handleError('Delete Subject', error)
        )
      );
  }
}
