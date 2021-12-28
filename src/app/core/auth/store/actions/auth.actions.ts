import {Action} from '@ngrx/store';

export enum AuthActionTypes {
    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-shadow
    LoginSuccess = '[Login] Login Success',
    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-shadow
    LoginFailure = '[Login] Login Failure',
}

export class LoginSuccess implements Action {
    public readonly type = AuthActionTypes.LoginSuccess;

    constructor(public payload: string) { }
}

export class LoginFailure implements Action {
    public readonly type = AuthActionTypes.LoginFailure;

    constructor(public payload: string) { }
}

export type AuthActionsAll =
    LoginSuccess
    | LoginFailure
    ;
