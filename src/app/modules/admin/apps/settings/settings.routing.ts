import { Route } from '@angular/router';
import { SettingsComponent } from 'app/modules/admin/apps/settings/settings.component';
import {UsersResolver, UsersUserResolver} from '../users/users.resolvers';
import {SettingsOrganizationComponent} from './organization/organization.component';
import {SettingsKeysComponent} from './apikeys/apikeys.component';
import {SettingsApiKeysResolver, SettingsOrganizationResolver} from "./settings.resolvers";

export const settingsRoutes: Route[] = [
    {
        path     : '',
        component: SettingsComponent,
        children : [
            {
                path     : 'organization',
                component: SettingsOrganizationComponent,
            },
            {
                path     : 'apikeys',
                component: SettingsKeysComponent
            }
        ],
        resolve  : {
            organization    : SettingsOrganizationResolver,
            apikeys    : SettingsApiKeysResolver,
        }
    }
];
