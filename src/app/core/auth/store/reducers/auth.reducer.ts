import * as AuthActions from '../actions/auth.actions';
import {AuthActionTypes} from '../actions/auth.actions';

export interface AuthState
{
    isLoggedIn: boolean;
    profile: string;
    givenName: string;
    familyName: string;
    email: string;
    accessToken: string;
}

export const authStateInitialState: AuthState = {
    isLoggedIn: false,
    profile: '',
    givenName: '',
    familyName: '',
    email: '',
    accessToken: ''
};

export const authReducer = (state = authStateInitialState, action: AuthActions.AuthActionsAll): AuthState => {
    switch ( action.type )
    {
        case AuthActionTypes.LoginSuccess:
        {
            const payload = action.payload || {};

            return {
                ...state,
                isLoggedIn: true,
                profile: payload['profile'],
                givenName: payload['given_name'],
                familyName: payload['family_name'],
                email: payload['email'],
                accessToken: payload['accessToken'],
            };
        }
        default:
            return state;
    }
};
