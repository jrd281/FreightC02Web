import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, catchError, from, Observable, of, switchMap, throwError} from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import {LoginSuccess} from './store/actions';
import {AuthAppState} from './store/reducers';
import {Store} from '@ngrx/store';
import Auth from '@aws-amplify/auth';
import {getAccessToken, getLoggedInState} from './store/selectors/auth.selectors';
import {Hub} from 'aws-amplify';

@Injectable()
export class AuthService
{
    private _authenticated: BehaviorSubject<boolean | null> = new BehaviorSubject(null);
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _store: Store<AuthAppState>
    )
    {

        Hub.listen('auth', (data) => {
            switch (data.payload.event) {
                case 'signIn':
                    console.log('user signed in');
                    break;
                case 'signUp':
                    console.log('user signed up');
                    break;
                case 'signOut':
                    console.log('user signed out');
                    break;
                case 'signIn_failure':
                    console.log('user sign in failed');
                    break;
                case 'configured':
                    console.log('the Auth module is configured');
            }
        });

        // @ts-ignore
        this._store.select(getLoggedInState)
            .pipe()
            .subscribe((value) => {
                this._authenticated.next(value);
            });

        this._store.select(getAccessToken)
            .pipe()
            .subscribe((value) => {
                this.accessToken = value;
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for contact
     */
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get authenticated$(): Observable<boolean>
    {
        return this._authenticated.asObservable();
    }

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated.next(false);

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return of(false);
    }

    /**
     * checkCognitoAuth
     */
    checkCognitoAuth(): Observable<any>
    {
        return from(Auth.currentAuthenticatedUser()
            .then((user) => {
                const jwtToken = user.signInUserSession.idToken.jwtToken;
                const loginSuccessObject = Object.assign({}, user.attributes);
                loginSuccessObject['accessToken'] = jwtToken;
                this._store.dispatch(new LoginSuccess(loginSuccessObject));
                return of(true);
            })
            .catch((err) => {
                console.error(err);
                return Auth.federatedSignIn();
            }));
    }
}
