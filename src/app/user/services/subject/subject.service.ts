import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { subjectResponse } from '../../models/Subject';
import { HttpService } from '../../../template/services/http/http.service';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/Subject`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService
  ) {}

  getAll(): Observable<subjectResponse[]> {
    const apiUrl = `${this.controllerUrl}`;
    return this._httpClient
      .get<subjectResponse[]>(`${apiUrl}`)
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetAllSubjects', error)
        )
      );
  }
}
