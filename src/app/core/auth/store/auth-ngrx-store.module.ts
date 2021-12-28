import {StoreModule} from '@ngrx/store';
import {authReducers} from './reducers';
import {NgModule} from '@angular/core';
import {authEffects} from './effects';

@NgModule({
    imports  : [
        // StoreModule.forFeature('auth', authReducers, {}),
        // EffectsModule.forFeature(authEffects)
    ],
    providers: []
})
export class AuthNgrxStoreModule
{
}
