import { Observable } from "rxjs";
import { ngUnlock } from "./ng-lock.decorator";

/**
 * Un lock the method when Observable is complete
 * @param methodToUnlock method to unlock
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function ngLockFinalize(methodToUnlock: Function) {
    return function <T>(source: Observable<T>): Observable<T> {
        return new Observable(() => {
            source.subscribe({
                complete() {
                    ngUnlock(methodToUnlock)
                }
            })
        });
    }
}

/**
 * Un lock the method when Observable changes
 * @param methodToUnlock method to unlock
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function ngLockChanges(methodToUnlock: Function) {
    return function <T>(source: Observable<T>): Observable<T> {
        return new Observable(() => {
            source.subscribe({
                error() {
                    ngUnlock(methodToUnlock)
                },
                next() {
                    ngUnlock(methodToUnlock)
                },
                complete() {
                    ngUnlock(methodToUnlock)
                }
            })
        });
    }
}