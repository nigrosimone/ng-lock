import { signal } from "@angular/core";
import { BehaviorSubject, Subscriber } from "rxjs";
import { NG_IS_LOCK_CALLBACK, NG_LOCK_LOCKED_CLASS, NG_LOCK_OPTION, NG_LOCK_SIGNAL, NG_LOCK_SUBJECT, NG_UNLOCK_CALLBACK, NgLockAllOption, NgLockOption } from "./ng-lock-types";
import { ngLockHtmlElement, ngUnLockHtmlElement } from "./ng-lock-utils";
import { ngLockElementByTargetEventArgument } from "./ng-lock-element-finder";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
    return function (_target: any, key: any, descriptor: any): void {

        let _options: NgLockAllOption;
        if (!options) {
            _options = { ...NgLockDefaultOption };
        } else {
            _options = { ...NgLockDefaultOption, ...options };
        }

        let callCounter: number = 0;
        let timeoutHandle: number | null = null;
        let elementToLock: Element | null = null;
        let lastResult: any = undefined;

        const originalMethod: any = descriptor.value;
        const ngLockSignal = signal(false);
        const ngLockSubject = new BehaviorSubject(false);

        const ngLockLog = (...args: any[]): void => {
            if (_options.debug) {
                console.log(...args);
            }
        }

        const ngUnlockCallback = (log: string): void => {
            let message = `NgLock: unlock method "${key}"`;
            message += `, reason: ${log ?? 'ngUnlock'}`;
            if (!ngIsLockCallback()) {
                message += ' (warning! the method is already unlocked)';
            }
            ngLockLog(message);
            callCounter = 0;
            if (_options.lockClass && elementToLock) {
                ngUnLockHtmlElement(elementToLock, _options);
            }
            if (_options.unlockTimeout && timeoutHandle) {
                clearTimeout(timeoutHandle);
            }

            ngLockSignal.set(false);
            ngLockSubject.next(false);
        };

        const ngIsLockCallback = (): boolean => {
            return callCounter >= _options?.maxCall;
        };


        ngLockLog(`NgLock: decorate method "${key}"`);

        descriptor.value = function (...args: any[]) {

            if (ngIsLockCallback()) {
                ngLockLog(`NgLock: method "${key}" locked`);
                if (_options.returnLastResultWhenLocked) {
                    return lastResult;
                }
                return;
            }
            callCounter++;

            if (_options.lockElementFunction) {
                elementToLock = _options.lockElementFunction(this, args);
            }
            if (ngIsLockCallback()) {
                if (_options.lockClass && elementToLock) {
                    ngLockHtmlElement(elementToLock, _options)
                }
                ngLockSignal.set(true);
                ngLockSubject.next(true);
                if (_options.unlockTimeout) {
                    timeoutHandle = setTimeout(() => {
                        ngUnlockCallback('unlockTimeout reached');
                    }, _options.unlockTimeout) as any;
                }
            }

            lastResult = originalMethod.apply(this, args);
            ngLockLog(`NgLock: execute method "${key}"`);


            if (_options.unlockOnPromiseResolve && lastResult && typeof lastResult.finally === 'function' && typeof lastResult.then === 'function' && lastResult[Symbol.toStringTag] === 'Promise') {
                (lastResult as Promise<any>).finally(() => {
                    ngUnlockCallback('Promise resolved');
                });
            }

            if (_options.unlockOnObservableChanges && lastResult && typeof lastResult?.destination?.partialObserver === 'object') {
                const obsNext = (lastResult.destination.partialObserver as Subscriber<any>).next;
                if (typeof obsNext === 'function') {
                    (lastResult.destination.partialObserver as Subscriber<any>).next = (...args: any[]) => {
                        ngUnlockCallback('Subscription changes');
                        obsNext(args);
                    }
                }
                const obsError = (lastResult.destination.partialObserver as Subscriber<any>).error;
                if (typeof obsError === 'function') {
                    (lastResult.destination.partialObserver as Subscriber<any>).error = (...args: any[]) => {
                        ngUnlockCallback('Subscription error');
                        obsError(args);
                    }
                }
                const obsComplete = (lastResult.destination.partialObserver as Subscriber<any>).complete;
                if (typeof obsComplete === 'function') {
                    (lastResult.destination.partialObserver as Subscriber<any>).complete = () => {
                        ngUnlockCallback('Subscription complete');
                        obsComplete();
                    }
                }
            }
            return lastResult;
        };

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
