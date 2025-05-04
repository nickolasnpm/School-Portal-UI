import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { classSubjectResponse } from '../../models/ClassSubject';
import { HttpService } from '../../../template/services/http/http.service';

@Injectable({
  providedIn: 'root',
})
export class ClassSubjectService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/ClassSubject`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService
  ) {}

  getAll(): Observable<classSubjectResponse[]> {
    const apiUrl = `${this.controllerUrl}`;

    return this._httpClient
      .get<classSubjectResponse[]>(`${apiUrl}`)
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetAllClassSubjects', error)
        )
      );
  }
}
