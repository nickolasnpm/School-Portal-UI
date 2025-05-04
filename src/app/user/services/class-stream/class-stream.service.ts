import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { classStreamResponse } from '../../models/ClassStream';
import { HttpService } from '../../../template/services/http/http.service';

@Injectable({
  providedIn: 'root',
})
export class ClassStreamService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/ClassStream`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService
  ) {}

  getAll(isActive: boolean): Observable<classStreamResponse[]> {
    const apiUrl = `${this.controllerUrl}`;
    let params = new HttpParams();
    params = params.append('isActive', isActive);
    return this._httpClient
      .get<classStreamResponse[]>(apiUrl, { params })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetAllClassStreams', error)
        )
      );
  }
}
