import { Route } from '@angular/router';
import {HomeComponent} from './home.component';
import {HomeResolver} from './home.resolvers';
import {SettingsOrganizationResolver} from '../settings/settings.resolvers';

export const homeRoutes: Route[] = [
    {
        path     : '',
        component: HomeComponent,
        resolve  : {
            home: HomeResolver,
            settings: SettingsOrganizationResolver
        }
    }
];
