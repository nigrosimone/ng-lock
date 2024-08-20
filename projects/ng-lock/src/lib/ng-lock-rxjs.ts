import { Observable } from "rxjs";
import { ngUnlock } from "./ng-lock.decorator";

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