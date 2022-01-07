import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {UsersService} from '../../users/users.service';
import {SettingsService} from '../settings.service';
import {Subject, takeUntil} from 'rxjs';
import {User} from '../../users/users.types';
import {SettingsOrganization} from '../settings.types';
import {Store} from '@ngrx/store';
import {AuthAppState} from '../../../../../core/auth/store/reducers';
import {getIsAdminUser} from '../../../../../core/auth/store/selectors/auth.selectors';
import {FuseConfirmationService} from "../../../../../../@fuse/services/confirmation";

@Component({
    selector       : 'settings-organization',
    templateUrl    : './organization.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsOrganizationComponent implements OnInit, OnDestroy
{
    organizationForm: FormGroup;
    settingsOrganization: SettingsOrganization;
    editMode: boolean = false;
    canEdit: boolean = false;

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
        this.organizationForm = this._formBuilder.group({
            name    : [''],
            website   : [''],
            email: ['', Validators.email],
            phone: [''],
            addressOne: [''],
            addressTwo: [''],
            city: [''],
            state: [''],
            country: [''],
        });

        // Get the settings organization
        this._settingsService.settingsOrganization$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settingsOrganization: SettingsOrganization) => {
                this.settingsOrganization = settingsOrganization;

                this.organizationForm.patchValue(this.settingsOrganization);
            });

        this._store.select(getIsAdminUser)
            .pipe()
            .subscribe((value) => {
                this.canEdit = value;
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

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void
    {
        if ( editMode === null )
        {
            this.editMode = !this.editMode;
        }
        else
        {
            this.editMode = editMode;
        }

        if( this.editMode !== true ) {
            this.organizationForm.patchValue(this.settingsOrganization);
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    saveInformation(): void {
        // Get the user object
        const updatedSettingsOrg = this.organizationForm.getRawValue();

        this._settingsService.saveSettingsOrganization(updatedSettingsOrg).subscribe((newUser) => {
            this.toggleEditMode(false);
        },(error) => {
            const errorConfirmation = this._fuseConfirmationService.open({
                title  : 'Error',
                message: error,
                icon: {
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'error'
                },
                actions: {
                    confirm: {
                        label: 'OK'
                    },
                    cancel: {
                        show: false
                    }
                }
            });
        });
    }
}
