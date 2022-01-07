import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, tap, throwError} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {SettingsAPIKeys, SettingsOrganization} from './settings.types';

@Injectable({
    providedIn: 'root'
})
export class SettingsService
{
    // Private
    private _backendUrl: string =  environment.resourceServerUrl;
    private _settingsOrganization: BehaviorSubject<SettingsOrganization | null> = new BehaviorSubject(null);
    private _settingsApiKeys: BehaviorSubject<SettingsAPIKeys | null> = new BehaviorSubject(null);

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
     * Getter for user
     */
    get settingsOrganization$(): Observable<SettingsOrganization>
    {
        return this._settingsOrganization.asObservable();
    }

    get settingsApiKeys$(): Observable<SettingsAPIKeys>
    {
        return this._settingsApiKeys.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get settings organization
     */
    getSettingsOrganization(): Observable<any>
    {
        const endpoint = this._backendUrl + '/settings/organization';
        return this._httpClient.get<any>(endpoint).pipe(
            tap((response: any[]) => {
                const settings = response[0] !== undefined ? response[0] : {};
                this._settingsOrganization.next(settings);
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

    /**
     * Get settings organization
     */
    saveSettingsOrganization(update: SettingsOrganization): Observable<any>
    {
        const endpoint = this._backendUrl + '/settings/organization';
        return this._httpClient.patch<any>(endpoint, update).pipe(
            tap((response: any[]) => {
                const settings = response[0] !== undefined ? response[0] : {};
                this._settingsOrganization.next(settings);
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

    /**
     * Get settings api keys
     */
    getSettingsApiKeys(): Observable<any>
    {
        const endpoint = this._backendUrl + '/settings/apikeys';
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
