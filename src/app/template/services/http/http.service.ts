import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})

//  imported by other services
export class HttpService {
  constructor() {}

  public handleError(methodName: string, error: HttpErrorResponse) {
    console.error(`Error ${methodName}:`, error);
    return throwError(() => error);
  }

  public appendParamsIfDefined(
    params: HttpParams,
    key: string,
    value: any
  ): HttpParams {
    if (value) {
      return params.append(key, value.toString());
    }
    return params;
  }
}
