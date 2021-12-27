import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {Amplify} from 'aws-amplify';
import Auth from '@aws-amplify/auth';
import {Store} from '@ngrx/store';
import {AuthConfigModel} from './auth-config.model';
import {environment} from '../../../environments/environment';
import {FuseConfirmationService} from '../../../@fuse/services/confirmation';

@Injectable()
export class AuthConfigService implements Resolve<any> {
    public remoteConfig$: BehaviorSubject<AuthConfigModel>;

    private _backendUrl: string =  environment.resourceServerUrl;
    private _isProd: boolean = environment.production;
    private _envStage: string =  environment.stage;
    private _remoteConfig: AuthConfigModel;

    constructor(private _httpClient: HttpClient,
                private _fuseConfirmationService: FuseConfirmationService) {
        this.remoteConfig$ = new BehaviorSubject<AuthConfigModel>({} as AuthConfigModel);
    }

    /**
     *
     * @param route
     * @param state
     * @returns
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<void> | any | void{
        return new Promise<void>((resolve, reject) => {

            Promise.all([
                this.getRemoteConfig()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    public initialize(): Promise<AuthConfigModel> {
        return this.getRemoteConfig();
    }

    /**
     * Get groups
     *
     * @returns
     */
    public getRemoteConfig(): Promise<AuthConfigModel> {
        let params = {};
        if ( this._isProd === true ) {
            const href = window.location.href;
            const parts = href.split('.');
            const subdomain = parts[0];
            params = new HttpParams().set('tenantId', subdomain);
        } else {
            params = new HttpParams().set('tenantId', this._envStage);
        }

        const endpoint = this._backendUrl + '/webauthconfig';

        // tslint:disable-next-line:no-unused-expression
        return new Promise((resolve, reject) => {
                this._httpClient.get(endpoint, {params: params})
                    .subscribe((response: any) => {
                        this._remoteConfig = response as AuthConfigModel;
                        // tHere is a code smell going on here...
                        Amplify.configure(this._remoteConfig);

                        this.remoteConfig$.next(this._remoteConfig);
                        resolve(this._remoteConfig);
                    }, (error: HttpErrorResponse) => {
                        const errorMessage = error.message;
                        const errorConfirmation = this._fuseConfirmationService.open({
                            title: 'Error',
                            message: errorMessage,
                            icon: {
                                show: true,
                                name: 'heroicons_outline:exclamation',
                                color: 'error'
                            },
                            actions: {
                                confirm: {
                                    label: 'OK'
                                }
                            }
                        });
                    });
            }
        );
    }
}
