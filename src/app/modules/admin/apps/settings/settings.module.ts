import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FuseAlertModule } from '@fuse/components/alert';
import { SharedModule } from 'app/shared/shared.module';
import { SettingsComponent } from 'app/modules/admin/apps/settings/settings.component';
import { SettingsOrganizationComponent } from 'app/modules/admin/apps/settings/organization/organization.component';
import { SettingsPasswordComponent } from 'app/modules/admin/apps/settings/password/settings-password.component';
import { settingsRoutes } from 'app/modules/admin/apps/settings/settings.routing';
import {SettingsKeysComponent} from './apikeys/apikeys.component';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
    declarations: [
        SettingsComponent,
        SettingsOrganizationComponent,
        SettingsPasswordComponent,
        SettingsKeysComponent
    ],
    imports     : [
        RouterModule.forChild(settingsRoutes),
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        FuseAlertModule,
        MatTooltipModule,
        SharedModule
    ]
})
export class SettingsModule
{
}
