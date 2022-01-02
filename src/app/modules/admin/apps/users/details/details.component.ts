import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { User } from 'app/modules/admin/apps/users/users.types';
import { UsersListComponent } from 'app/modules/admin/apps/users/list/list.component';
import { UsersService } from 'app/modules/admin/apps/users/users.service';
import {getIsAdminUser} from '../../../../../core/auth/store/selectors/auth.selectors';
import {Store} from '@ngrx/store';
import {AuthAppState} from "../../../../../core/auth/store/reducers";

@Component({
    selector       : 'users-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersDetailsComponent implements OnInit, OnDestroy
{
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    createMode: boolean = false;
    isAdminUser: boolean = false;
    user: User;
    userForm: FormGroup;
    users: User[];

    profileTypes: ProfileType[] = [
        { 'value' : 'USER', 'label': 'User'},
        { 'value' : 'POWER_USER', 'label': 'Power User'},
        { 'value' : 'ADMIN_USER', 'label': 'Admin'},
    ];
    activeTypes: ActiveType[] = [
        { 'value' : true, 'label': 'Active'},
        { 'value' : false, 'label': 'Inactive'},
    ];

    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _store: Store<AuthAppState>,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usersListComponent: UsersListComponent,
        private _usersService: UsersService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
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
        // Open the drawer
        this._usersListComponent.matDrawer.open();

        // Create the user form
        this.userForm = this._formBuilder.group({
            id          : [''],
            avatar      : [null],
            firstName   : ['', [Validators.required]],
            lastName    : ['', [Validators.required]],
            email       : ['', [Validators.required]],
            active      : [true],
            profile     : ['USER']
        });

        this._store.select(getIsAdminUser)
            .pipe()
            .subscribe((value) => {
                this.isAdminUser = value;
            });

        // Get the users
        this._usersService.users$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((users: User[]) => {
                this.users = users;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the user
        this._usersService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {

                // Open the drawer in case it is closed
                this._usersListComponent.matDrawer.open();

                // Get the user
                this.user = user;

                this.setUpEditView(this.user);

                // Clear the password controls so they
                // don't interfere with validation
                //this.clearPasswords();

                // Toggle the edit mode off
                if ( user.id === 'new' ) {
                    this.toggleEditMode(true);
                    this.toggleCreateMode(true);
                }
                else {
                    this.toggleEditMode(false);
                    this.toggleCreateMode(false);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
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

        // Dispose the overlays if they are still on the DOM
        if ( this._tagsPanelOverlayRef )
        {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._usersListComponent.matDrawer.close();
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

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle create mode
     *
     * @param createMode
     */
    toggleCreateMode(createMode: boolean | null = null): void
    {
        if ( createMode === null )
        {
            this.createMode = !this.createMode;
        }
        else
        {
            this.createMode = createMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    /**
     * Update the user
     */
    updateUser(): void
    {
        // Get the user object
        const user = this.userForm.getRawValue();

        // Go through the user object and clear empty values
        user.emails = user.emails.filter(email => email.email);

        user.phoneNumbers = user.phoneNumbers.filter(phoneNumber => phoneNumber.phoneNumber);

        // Update the user on the server
        this._usersService.updateUser(user.id, user).subscribe(() => {

            // Toggle the edit mode off
            this.toggleEditMode(false);
        });
    }

    /**
     * Delete the user
     */
    deleteUser(): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Delete user',
            message: 'Are you sure you want to delete this user? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                // Get the current user's id
                const id = this.user.id;

                // Get the next/previous user's id
                const currentUserIndex = this.users.findIndex(item => item.id === id);
                const nextUserIndex = currentUserIndex + ((currentUserIndex === (this.users.length - 1)) ? -1 : 1);
                const nextUserId = (this.users.length === 1 && this.users[0].id === id) ? null : this.users[nextUserIndex].id;

                // Delete the user
                this._usersService.deleteUser(id)
                    .subscribe((isDeleted) => {

                        // Return if the user wasn't deleted...
                        if ( !isDeleted )
                        {
                            return;
                        }

                        // Navigate to the next user if available
                        if ( nextUserId )
                        {
                            this._router.navigate(['../', nextUserId], {relativeTo: this._activatedRoute});
                        }
                        // Otherwise, navigate to the parent
                        else
                        {
                            this._router.navigate(['../'], {relativeTo: this._activatedRoute});
                        }

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    cancelEdit(): void {
        this.toggleEditMode(false);
        this.setUpEditView(this.user);
    }

    /**
     * Upload avatar
     *
     * @param fileList
     */
    uploadAvatar(fileList: FileList): void
    {
        // Return if canceled
        if ( !fileList.length )
        {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];

        // Return if the file is not allowed
        if ( !allowedTypes.includes(file.type) )
        {
            return;
        }

        // Upload the avatar
        this._usersService.uploadAvatar(this.user.id, file).subscribe();
    }

    /**
     * Remove the avatar
     */
    removeAvatar(): void
    {
        // Get the form control for 'avatar'
        const avatarFormControl = this.userForm.get('avatar');

        // Set the avatar as null
        avatarFormControl.setValue(null);

        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;

        // Update the user
        this.user.avatar = null;
    }

    /**
     * Add the email field
     */
    addEmailField(): void
    {
        // Create an empty email form group
        const emailFormGroup = this._formBuilder.group({
            email: [''],
            label: ['']
        });

        // Add the email form group to the emails form array
        (this.userForm.get('emails') as FormArray).push(emailFormGroup);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the email field
     *
     * @param index
     */
    removeEmailField(index: number): void
    {
        // Get form array for emails
        const emailsFormArray = this.userForm.get('emails') as FormArray;

        // Remove the email field
        emailsFormArray.removeAt(index);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add an empty phone number field
     */
    addPhoneNumberField(): void
    {
        // Create an empty phone number form group
        const phoneNumberFormGroup = this._formBuilder.group({
            country    : ['us'],
            phoneNumber: [''],
            label      : ['']
        });

        // Add the phone number form group to the phoneNumbers form array
        (this.userForm.get('phoneNumbers') as FormArray).push(phoneNumberFormGroup);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the phone number field
     *
     * @param index
     */
    removePhoneNumberField(index: number): void
    {
        // Get form array for phone numbers
        const phoneNumbersFormArray = this.userForm.get('phoneNumbers') as FormArray;

        // Remove the phone number field
        phoneNumbersFormArray.removeAt(index);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    private setUpEditView(user: User): void {
        // Patch values to the form
        this.userForm.patchValue(user);
    }
}

export class ActiveType {
    value: boolean;
    label: string;
}

export class ProfileType {
    value: string;
    label: string;
}
