import {Pipe, PipeTransform} from '@angular/core';
import {User} from "../users.types";

@Pipe({
  name: 'groupPipe'
})
export class GroupPipe implements PipeTransform {

    transform(value: User, ...args: unknown[]): unknown {
        return '';
    }

}
