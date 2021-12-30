import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { UsersService } from 'app/modules/admin/apps/users/users.service';
import { User } from 'app/modules/admin/apps/users/users.types';

@Injectable({
    providedIn: 'root'
})
export class UsersResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _usersService: UsersService)
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User[]>
    {
        return this._usersService.getUsers();
    }
}

@Injectable({
    providedIn: 'root'
})
export class UsersUserResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _usersService: UsersService,
        private _router: Router
    )
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User>
    {
        return this._usersService.getUserById(route.paramMap.get('id'))
                   .pipe(
                       // Error here means the requested user is not available
                       catchError((error) => {

                           // Log the error
                           console.error(error);

                           // Get the parent url
                           const parentUrl = state.url.split('/').slice(0, -1).join('/');

                           // Navigate to there
                           this._router.navigateByUrl(parentUrl);

                           // Throw an error
                           return throwError(error);
                       })
                   );
    }
}
