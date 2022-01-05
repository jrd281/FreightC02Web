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
import {AuthAppState} from '../../../../../core/auth/store/reducers';
import {PasswordChangeComponent} from '../password-change/password-change.component';
import {MatDialog} from '@angular/material/dialog';

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
        { 'value' : 'USER', 'label': 'User', 'description': 'Can view reports'},
        { 'value' : 'POWER_USER', 'label': 'Power User', 'description': 'Can view reports and add Users'},
        { 'value' : 'ADMIN_USER', 'label': 'Admin', 'description': 'Can view reports, modify all Users and view client keys'},
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
        private _viewContainerRef: ViewContainerRef,
        private _matDialog: MatDialog
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
            profile     : ['USER', [Validators.required]]
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

                // Reset the user form since we've got
                // a new user
                this.userForm.reset();

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
     * We need a function to provide the label for the profile type
     * dropdown since the value is changed
     */
    public profileTypeLabelFunction(profileTypeValue: string): string {
        const filteredProfileType = this.profileTypes.find(value => value.value === profileTypeValue);
        const filteredProfileLabel = filteredProfileType !== undefined ? filteredProfileType['label'] : '';
        return filteredProfileLabel;
    }

    /**
     * Save the user
     */
    saveUser(): void
    {
        // Get the user object
        const user = this.userForm.getRawValue();

        if ( user.id === 'new' ) {
            // Create the user on the server
            this._usersService.postUser(user).subscribe((newUser) => {
                if ( newUser )
                {
                    const id = newUser.id;
                    this._router.navigate(['../', id], {relativeTo: this._activatedRoute});
                }
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
        } else {
            // Create the user on the server
            this._usersService.patchUser(user).subscribe((updatedUser) => {
                    this._fuseConfirmationService.open({
                        title  : 'Update Successful',
                        message: 'Update Successful',
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

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
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
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    private changePassword(): void {
        this._matDialog.open(PasswordChangeComponent, {
            autoFocus: false,
            data     : {
                user: this.user
            }
        });
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
    description: string;
}
