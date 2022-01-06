import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector       : 'settings-organization',
    templateUrl    : './organization.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsOrganizationComponent implements OnInit
{
    organizationForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder
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
            name    : ['Alphabet'],
            website   : ['www.google.com'],
            email: ['hughes.brian@mail.com', Validators.email],
            phone: ['121-490-33-12'],
            addressOne: ['100 Main St'],
            addressTwo: ['Apt. 35B'],
            city: ['Spartanburg'],
            state: ['SC'],
            country: ['usa'],
        });
    }
}
