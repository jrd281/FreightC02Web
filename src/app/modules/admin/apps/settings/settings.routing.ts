import { Route } from '@angular/router';
import { SettingsComponent } from 'app/modules/admin/apps/settings/settings.component';
import {UsersResolver, UsersUserResolver} from '../users/users.resolvers';
import {SettingsOrganizationComponent} from './organization/organization.component';
import {SettingsKeysComponent} from './apikeys/apikeys.component';

export const settingsRoutes: Route[] = [
    {
        path     : '',
        component: SettingsComponent,
        children : [
            {
                path     : 'organization',
                component: SettingsOrganizationComponent,
                resolve  : {
                    resolver    : UsersResolver,
                }
            },
            {
                path     : 'apikeys',
                component: SettingsKeysComponent,
                resolve  : {
                    resolver    : UsersResolver,
                }
            }
        ]
    }
];
