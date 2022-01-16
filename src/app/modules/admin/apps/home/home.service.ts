import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {BehaviorSubject, catchError, map, Observable, tap, throwError} from 'rxjs';
import {environment} from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HomeService
{
    private _backendUrl: string =  environment.resourceServerUrl;
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any>
    {
        return this._data.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(): Observable<any>
    {
        const endpoint = this._backendUrl + '/info';
        return this._httpClient.get<any>(endpoint).pipe(
            tap((response: any[]) => {
                const settings = response[0] !== undefined ? response[0] : {};
                this._settingsApiKeys.next(settings);
            }),
            catchError((httpResponse: HttpResponse<any>) => {
                const errorMessage = this.getErrorMessage(httpResponse);
                // Log the error
                console.error(errorMessage);

                // Throw an error
                return throwError(errorMessage);
            }),
        );
    }

    getErrorMessage(httpResponse: HttpResponse<any>): string {
        let errorMessage = httpResponse['error'] ??  httpResponse['message'] ?? '';

        // This is because a Cognito error will output the "AdminUserSet permissions...: User friendly error"
        errorMessage = errorMessage.indexOf(':') > -1 ? errorMessage.substr(errorMessage.indexOf(':')  + 1, errorMessage.length) : errorMessage;

        return errorMessage;
    }
}
