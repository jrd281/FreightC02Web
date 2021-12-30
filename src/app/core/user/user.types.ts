export interface User
{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    lastLogin: Date;
    active: boolean;
    status: string;
    profile: string;
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function createUser(): User {
    const returnUser = {
        'id': '',
        'firstName': '',
        'lastName': '',
        'email' : '',
        'active': true,
        'status': '',
        'profile': ''
    } as User;

    return returnUser;
}
