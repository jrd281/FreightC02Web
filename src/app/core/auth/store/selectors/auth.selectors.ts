import {AuthAppState, AuthState, getAuthState} from '../reducers';
import {createSelector} from '@ngrx/store';

export const getLoggedInState = createSelector(
    getAuthState,
    (state: AuthState) => {
        return state.isLoggedIn;
    }
);

export const getAccessToken = createSelector(
    getAuthState,
    (state: AuthState) => state.accessToken
);

export const getCanEditRule = createSelector(
    getAuthState,
    (state: AuthState) => state.profile === 'POWER_USER' || state.profile === 'ADMIN_USER'
);

export const getIsPowerUser = createSelector(
    getAuthState,
    (state: AuthState) => state.profile === 'POWER_USER'
);

export const getIsAdminUser = createSelector(
    getAuthState,
    (state: AuthState) => state.profile === 'ADMIN_USER'
);
