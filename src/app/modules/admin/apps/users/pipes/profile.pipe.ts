import {Pipe, PipeTransform} from '@angular/core';
import {User} from '../users.types';

@Pipe({
  name: 'profilePipe'
})
export class ProfilePipe implements PipeTransform {

  transform(value: User, ...args: unknown[]): unknown {
      const profile = value.profile ?? '';
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const profileMap = { 'ADMIN_USER': 'Admin', 'POWER_USER': 'Power User', 'USER' : 'User' };
      const matchingProfile = profileMap[profile] !== undefined ? profileMap[profile] : 'N/A';
    return matchingProfile;
  }
}
