import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ElementRef,
    OnInit, Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ConfirmPasswordValidator} from '../../../../../shared/validators/password-change.validators';
import {FuseConfirmationService} from '../../../../../../@fuse/services/confirmation';
import {SettingsService} from '../settings.service';

@Component({
    selector       : 'settings-password',
    templateUrl    : './settings-password.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPasswordComponent implements OnInit
{
    passwordChangeForm: FormGroup;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild('changePasswordButton') changePasswordButton: ElementRef;
    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _settingsService: SettingsService,
        private _renderer2: Renderer2,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
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
        // Prepare the form
        this.passwordChangeForm = this._formBuilder.group({
                password        : ['', Validators.required],
                confirmPassword : ['', Validators.required]
            },
            {
                validators: ConfirmPasswordValidator('password', 'confirmPassword')
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    changePassword(): void {
        const passwordControl = this.passwordChangeForm.get('confirmPassword');
        const password = String(passwordControl.value).trim();

        this._settingsService.changePassword(password ).subscribe((response) => {
                const confirmation = this._fuseConfirmationService.open({
                    title  : 'Change Successful',
                    message: 'Change Successful',
                    icon: {
                        show: true,
                        name: 'heroicons_outline:check-circle',
                        color: 'success'
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

                // Subscribe to the confirmation dialog closed action
                confirmation.afterClosed().subscribe((result) => {

                    this.resetPasswordChangeForm();

                    this._changeDetectorRef.markForCheck();
                });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            },
            (error) => {
                this._fuseConfirmationService.open({
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

    cancel(): void {
        this.passwordChangeForm.reset({
            password: '',
            confirmPassword: ''
        });

        Object.keys(this.passwordChangeForm.controls).forEach(
            (field) => {
                this.passwordChangeForm.get(field).setErrors(null);
            }
        );

        this.passwordChangeForm.markAsPristine();
        this.passwordChangeForm.markAsUntouched();
        this.passwordChangeForm.updateValueAndValidity();
    }

    private resetPasswordChangeForm(): void {
        // I have to do all this because through the normal methods
        // I can only get one of two things to happen.
        //   1. The error messages are removed from the text intput boxes
        //   or
        //   2. The Change Password button is disabled.
        this.passwordChangeForm.reset();
        Object.keys(this.passwordChangeForm.controls).forEach(
            (field) => {
                this.passwordChangeForm.get(field).setErrors(null);
            }
        );
        this._renderer2.setProperty(this.changePasswordButton, 'disabled', true);
    }
}
