import { Route } from '@angular/router';
import { ProjectComponent } from 'app/modules/admin/dashboards/project/project.component';
import { ProjectResolver } from 'app/modules/admin/dashboards/project/project.resolvers';
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
