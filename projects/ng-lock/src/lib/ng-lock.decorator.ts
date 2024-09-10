import { signal } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { NG_IS_LOCK_CALLBACK, NG_LOCK_LOCKED_CLASS, NG_LOCK_OPTION, NG_LOCK_SIGNAL, NG_LOCK_SUBJECT, NG_UNLOCK_CALLBACK, NgLockAllOption, NgLockOption } from "./ng-lock-types";
import { isObserver, isPromise, ngLockHtmlElement, ngUnLockHtmlElement } from "./ng-lock-utils";
import { ngLockElementByTargetEventArgument } from "./ng-lock-element-finder";

/**
 * ngLock default options
 * @see NgLockOption
 */
export const NgLockDefaultOption: NgLockAllOption = {
    maxCall: 1,
    unlockTimeout: null,
    lockElementFunction: ngLockElementByTargetEventArgument(),
    lockClass: NG_LOCK_LOCKED_CLASS,
    returnLastResultWhenLocked: false,
    unlockOnPromiseResolve: true,
    unlockOnObservableChanges: true,
    debug: false
} as const;

/**
 * Lock the decorated function
 * @param {NgLockOption} options (optional) NgLockOption
 * @return {MethodDecorator} Return a MethodDecorator
 */
export function ngLock(options?: NgLockOption): MethodDecorator {
    return function <T>(_target: object, key: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void {
        let _options: NgLockAllOption;
        if (!options) {
            _options = { ...NgLockDefaultOption };
        } else {
            _options = { ...NgLockDefaultOption, ...options };
        }

        let callCounter: number = 0;
        let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
        let elementToLock: Element | null = null;
        let lastResult: any;

        const originalMethod: any = descriptor.value;
        const ngLockSignal = signal(false);
        const ngLockSubject = new BehaviorSubject(false);

        const ngLockLog = (...args: unknown[]): void => {
            if (_options.debug) {
                console.log(...args);
            }
        }

        const ngUnlockCallback = (log: string): void => {
            let message = `NgLock: unlock method "${key.toString()}"`;
            message += `, reason: ${log ?? 'ngUnlock'}`;
            if (!ngIsLockCallback()) {
                message += ' (warning! the method is already unlocked)';
            }
            ngLockLog(message);

            callCounter = 0;

            ngUnLockHtmlElement(elementToLock, _options);

            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
            }

            ngLockSignal.set(false);
            ngLockSubject.next(false);
        };

        const ngIsLockCallback = (): boolean => callCounter >= _options?.maxCall;

        ngLockLog(`NgLock: decorate method "${key.toString()}"`);

        descriptor.value = function (...args: unknown[]) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;

            if (ngIsLockCallback()) {
                ngLockLog(`NgLock: method "${key.toString()}" locked`);
                if (_options.returnLastResultWhenLocked) {
                    return lastResult;
                }
                return;
            }
            callCounter++;

            if (typeof _options.lockElementFunction === 'function') {
                elementToLock = _options.lockElementFunction(self, args);
            }
            if (ngIsLockCallback()) {
                ngLockHtmlElement(elementToLock, _options)
                ngLockSignal.set(true);
                ngLockSubject.next(true);
                if (_options.unlockTimeout && _options.unlockTimeout > 0) {
                    timeoutHandle = setTimeout(() => ngUnlockCallback('unlockTimeout reached'), _options.unlockTimeout);
                }
            }

            lastResult = originalMethod.apply(self, args);
            ngLockLog(`NgLock: execute method "${key.toString()}"`);

            if (_options.unlockOnPromiseResolve && isPromise(lastResult)) {
                (lastResult as Promise<unknown>).finally(() => ngUnlockCallback('Promise resolved'));
            } else if (_options.unlockOnObservableChanges && isObserver(lastResult)) {
                const obsNext = lastResult.destination.partialObserver.next;
                if (typeof obsNext === 'function') {
                    lastResult.destination.partialObserver.next = (...args: unknown[]) => {
                        ngUnlockCallback('Subscription changes');
                        obsNext(args);
                    };
                }
                const obsError = lastResult.destination.partialObserver.error;
                if (typeof obsError === 'function') {
                    lastResult.destination.partialObserver.error = (...args: unknown[]) => {
                        ngUnlockCallback('Subscription error');
                        obsError(args);
                    };
                }
                const obsComplete = lastResult.destination.partialObserver.complete;
                if (typeof obsComplete === 'function') {
                    lastResult.destination.partialObserver.complete = () => {
                        ngUnlockCallback('Subscription complete');
                        obsComplete();
                    };
                }
            }
            return lastResult;
        } as unknown as T;

        Object.defineProperty(descriptor.value, 'ngLock', {
            value: {
                [NG_LOCK_OPTION]: () => _options,
                [NG_UNLOCK_CALLBACK]: ngUnlockCallback,
                [NG_IS_LOCK_CALLBACK]: ngIsLockCallback,
                [NG_LOCK_SIGNAL]: () => ngLockSignal.asReadonly(),
                [NG_LOCK_SUBJECT]: () => ngLockSubject.asObservable(),
            }, enumerable: true, writable: false
        });

        return descriptor;
    };
}
