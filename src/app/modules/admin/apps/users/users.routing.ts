import { Route } from '@angular/router';
import { CanDeactivateUsersDetails } from 'app/modules/admin/apps/users/users.guards';
import { UsersUserResolver, UsersResolver } from 'app/modules/admin/apps/users/users.resolvers';
import { UsersComponent } from 'app/modules/admin/apps/users/users.component';
import { UsersListComponent } from 'app/modules/admin/apps/users/list/list.component';
import { UsersDetailsComponent } from 'app/modules/admin/apps/users/details/details.component';

export const usersRoutes: Route[] = [
    {
        path     : '',
        component: UsersComponent,
        children : [
            {
                path     : '',
                component: UsersListComponent,
                resolve  : {
                    tasks    : UsersResolver,
                },
                children : [
                    {
                        path         : ':id',
                        component    : UsersDetailsComponent,
                        resolve      : {
                            task     : UsersUserResolver,
                        },
                        canDeactivate: [CanDeactivateUsersDetails]
                    }
                ]
            }
        ]
    }
];
