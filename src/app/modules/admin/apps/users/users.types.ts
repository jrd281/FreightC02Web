export interface User
{
    id: string;
    avatar: string;
    name: string;
    background: string;
    firstName: string;
    lastName: string;
    email: string;
    lastLogin: Date;
    active: boolean;
    status: string;
    profile: string;
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function createDefaultUser(): User {
    const returnUser = {
        'id': '',
        'avatar': '',
        'background': '',
        'name': '',
        'firstName': '',
        'lastName': '',
        'email' : '',
        'active': true,
        'status': '',
        'profile': 'USER'
    } as User;

    return returnUser;
}
