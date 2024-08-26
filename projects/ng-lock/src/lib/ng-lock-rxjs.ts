import { Observable } from "rxjs";
import { ngUnlock } from "./ng-lock.decorator";

/**
 * Un lock the method when Observable changes
 * @param methodToUnlock method to unlock
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function ngLockChanges(methodToUnlock: Function) {
    return function <T>(source: Observable<T>): Observable<T> {
        return new Observable((subscriber) => {
            const subscription = source.subscribe({
                next(value) {
                    subscriber.next(value);
                    ngUnlock(methodToUnlock, 'Observable changes')
                },
                error(error) {
                    subscriber.error(error);
                    ngUnlock(methodToUnlock, 'Observable error')
                },
                complete() {
                    subscriber.complete();
                    ngUnlock(methodToUnlock, 'Observable complete')
                }
            })
            return () => subscription.unsubscribe();
        });
    }
}