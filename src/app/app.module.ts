import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { FuseModule } from '@fuse';
import { FuseConfigModule } from '@fuse/services/config';
import { FuseMockApiModule } from '@fuse/lib/mock-api';
import { CoreModule } from 'app/core/core.module';
import { appConfig } from 'app/core/config/app.config';
import { mockApiServices } from 'app/mock-api';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes } from 'app/app.routing';
import {EffectsModule} from '@ngrx/effects';
import {MetaReducer, StoreModule} from '@ngrx/store';
import {authReducer} from './core/auth/store/reducers';
import {environment} from '../environments/environment';
import {storeFreeze} from 'ngrx-store-freeze';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {AuthConfigService} from './core/auth/auth-config.service';
import {AuthService} from './core/auth/auth.service';
import {Observable} from 'rxjs';
import {AuthConfigModel} from './core/auth/auth-config.model';

const routerConfig: ExtraOptions = {
    preloadingStrategy       : PreloadAllModules,
    scrollPositionRestoration: 'enabled'
};
export const startupServiceFactory = (authConfigService: AuthConfigService, authService: AuthService): () => Promise<Observable<any> | AuthConfigModel> => {
    return (): Promise<Observable<any> | AuthConfigModel> => {
        return authConfigService.initialize().then(value => authService.checkCognitoAuth());
    };
};

export const metaReducers: MetaReducer<any>[] = !environment.production
    ? [storeFreeze]
    : [];
@NgModule({
    declarations: [
        AppComponent
    ],
    imports     : [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, routerConfig),

        /**
         * StoreModule.forRoot is imported once in the root module, accepting a reducer
         * function or object map of reducer functions. If passed an object of
         * reducers, combineReducers will be run creating your application
         * meta-reducer. This returns all providers for an @ngrx/store
         * based application.
         */
        StoreModule.forRoot({ auth: authReducer},{
            metaReducers,
            runtimeChecks: {
                // strictStateImmutability and strictActionImmutability are enabled by default
                strictStateSerializability: true,
                strictActionSerializability: true,
                strictActionWithinNgZone: true,
                strictActionTypeUniqueness: true,
            },
        }),
        // EffectsModule.forRoot(effects),
        // Instrumentation must be imported after importing StoreModule (config is optional)
        StoreDevtoolsModule.instrument({
            maxAge: 25, // Retains last 25 states
            logOnly: environment.production, // Restrict extension to log-only mode
            autoPause: true, // Pauses recording actions and state changes when the extension window is not open
        }),

        // Fuse, FuseConfig & FuseMockAPI
        FuseModule,
        FuseConfigModule.forRoot(appConfig),
        FuseMockApiModule.forRoot(mockApiServices),

        // Core module of your application
        CoreModule,

        // Layout module of your application
        LayoutModule,

        // 3rd party modules that require global configuration via forRoot
        MarkdownModule.forRoot({})
    ],
    providers : [
        AuthConfigService,
        AuthService,
        {
            provide: APP_INITIALIZER,
            useFactory: startupServiceFactory,
            deps: [AuthConfigService, AuthService],
            multi: true
        }
    ],
    bootstrap   : [
        AppComponent
    ]
})
export class AppModule
{
}
