import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UsersService} from '../users.service';
import {User} from '../users.types';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {ConfirmPasswordValidator} from './password-change.validators';
import {FuseConfirmationService} from '../../../../../../@fuse/services/confirmation';

@Component({
  selector: 'password-change',
  templateUrl: './password-change.component.html',
  encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordChangeComponent implements OnInit, OnDestroy {

    @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;
    passwordChangeForm: FormGroup;

    // Private
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _user: User;
    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<PasswordChangeComponent>,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private _data: { user: User },
        private _usersService: UsersService
    )
    {
        this._user = _data.user;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Prepare the card form
        this.passwordChangeForm = this._formBuilder.group({
            password        : ['', Validators.required],
            confirmPassword : ['', Validators.required]
        },
            {
            validator: ConfirmPasswordValidator('password', 'confirmPassword')
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next({});
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    changePassword(): void {
        const passwordControl = this.passwordChangeForm.get('confirmPassword');
        const password = String(passwordControl.value).trim();

        this._usersService.changePassword(this._user.id, password ).subscribe((response) => {
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
                this.matDialogRef.close();
            });
        },
        (error) => {
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
