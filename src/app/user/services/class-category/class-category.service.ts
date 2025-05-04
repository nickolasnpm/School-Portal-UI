import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { classCategoryResponse } from '../../models/ClassCategory';
import { HttpService } from '../../../template/services/http/http.service';

@Injectable({
  providedIn: 'root',
})
export class ClassCategoryService {
  private readonly controllerUrl: string = `${environment.SchoolUserApiUrl}/ClassCategory`;

  constructor(
    private _httpClient: HttpClient,
    private _httpService: HttpService
  ) {}

  getAll(): Observable<classCategoryResponse[]> {
    const apiUrl = `${this.controllerUrl}`;

    return this._httpClient
      .get<classCategoryResponse[]>(`${apiUrl}`)
      .pipe(
        catchError((error) =>
          this._httpService.handleError('GetAllClassCategories', error)
        )
      );
  }
}
