import {Injectable} from '@angular/core';
import * as fromAuthActions from '../actions/auth.actions';
import {catchError, mergeMap, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {Actions} from '@ngrx/effects';

@Injectable()
export class AuthEffects {

    constructor(private actions$: Actions) {
    }
}
