import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector       : 'settings-information',
    templateUrl    : './information.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsInformationComponent implements OnInit
{
    informationForm: FormGroup;

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
        this.informationForm = this._formBuilder.group({
            companyName    : ['Alphabet'],
            companyWebsite   : ['www.google.com'],
            companyContactEmail: ['hughes.brian@mail.com', Validators.email],
            companyContactPhone: ['121-490-33-12'],
            companyStreetAddressOne: ['100 Main St'],
            companyStreetAddressTwo: ['Apt. 35B'],
            companyCity: ['Spartanburg'],
            companyState: ['SC'],
            companyCountry: ['usa'],
        });
    }
}
