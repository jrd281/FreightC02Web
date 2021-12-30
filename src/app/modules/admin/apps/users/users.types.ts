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
export function createUser(): User {
    const returnUser = {
        'id': '',
        'avatar': '',
        'background': '',
        'firstName': '',
        'lastName': '',
        'email' : '',
        'active': true,
        'status': '',
        'profile': ''
    } as User;

    return returnUser;
}
