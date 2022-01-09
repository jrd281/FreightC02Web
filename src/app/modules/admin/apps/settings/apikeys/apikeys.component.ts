import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';
import {SettingsAPIKeys, SettingsOrganization} from '../settings.types';
import {Store} from '@ngrx/store';
import {AuthAppState} from '../../../../../core/auth/store/reducers';
import {SettingsService} from '../settings.service';
import {FuseConfirmationService} from '../../../../../../@fuse/services/confirmation';

@Component({
    selector       : 'settings-apikeys',
    templateUrl    : './apikeys.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsKeysComponent implements OnInit, OnDestroy
{
    keysForm: FormGroup;
    settingsAPIKeys: SettingsAPIKeys;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _store: Store<AuthAppState>,
        private _settingsService: SettingsService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.keysForm = this._formBuilder.group({
            accessKeyId  : [''],
            secretAccessKey      : ['']
        });

        // Get the settings organization
        this._settingsService.settingsApiKeys$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settingsAPIKeys: SettingsAPIKeys) => {
                this.settingsAPIKeys = settingsAPIKeys;

                this.keysForm.patchValue(this.settingsAPIKeys);
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    createNewKeys(): void {
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Create New Keys',
            message: 'This will invalidate the current keyset.  Do you want to continue?',
            actions: {
                confirm: {
                    label: 'Get New Keys'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                this._settingsService
                    .reissueSettingsApiKeys()
                    .subscribe();
                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

    }
}
