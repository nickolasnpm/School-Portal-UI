import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { classRankResponse } from '../../models/ClassRank';
import { HttpService } from '../../../template/services/http/http.service';

@Injectable({
  providedIn: 'root',
})
export class ClassRankService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/ClassRank`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService
  ) {}

  getAll(isActive: boolean): Observable<classRankResponse[]> {
    const apiUrl = `${this.controllerUrl}`;

    let params = new HttpParams();
    params = params.append('isActive', isActive);

    return this._httpClient
      .get<classRankResponse[]>(apiUrl, { params })
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetAllClassRanks', error)
        )
      );
  }
}
