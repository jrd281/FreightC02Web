import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable} from 'rxjs';
import {SettingsService} from './settings.service';

@Injectable({
    providedIn: 'root'
})
export class SettingsOrganizationResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _settingsService: SettingsService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._settingsService.getSettingsOrganization();
    }
}

@Injectable({
    providedIn: 'root'
})
export class SettingsApiKeysResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _settingsService: SettingsService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._settingsService.getSettingsApiKeys();
    }
}
