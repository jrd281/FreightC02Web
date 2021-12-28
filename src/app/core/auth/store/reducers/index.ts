import {ActionReducerMap, createFeatureSelector} from '@ngrx/store';
import {authReducer, AuthState} from './auth.reducer';

export interface AuthAppState
{
    authState: AuthState;
}

export const getAuthState = createFeatureSelector<AuthState>(
    'auth'
);

export const authReducers: ActionReducerMap<AuthAppState> = {
    authState  : authReducer
};

export * from './auth.reducer';
