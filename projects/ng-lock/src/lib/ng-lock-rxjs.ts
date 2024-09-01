import { Observable, tap } from "rxjs";
import type { NgLockFunction } from "./ng-lock-types";
import { ngUnlock } from "./ng-lock-utils";

/**
 * Unlock the method when Observable changes
 * @param {NgLockFunction} methodToUnlock method to unlock
 * @returns {(source$: Observable<T>) => Observable<T>}
 */
export const ngLockChanges = <T>(methodToUnlock: NgLockFunction): (source$: Observable<T>) => Observable<T> => {
    return (source$: Observable<T>): Observable<T> => {
        return source$.pipe(tap(() => ngUnlock(methodToUnlock, 'Observable changes')));
    }
}