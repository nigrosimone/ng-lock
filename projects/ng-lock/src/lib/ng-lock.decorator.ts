import { Signal, signal } from "@angular/core";
import { BehaviorSubject, Observable, Subscriber } from "rxjs";
import { NgLockElementFinder, NgLockElementFunction, NgLockFunction } from "./ng-lock-types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const NG_UNLOCK_CALLBACK = 'ngUnlockCallback';
export const NG_IS_LOCK_CALLBACK = 'ngIsLockCallback';
export const NG_LOCK_SIGNAL = 'ngLockSignal';
export const NG_LOCK_SUBJECT = 'ngLockSubject';
export type NG_CALLBACKS = typeof NG_UNLOCK_CALLBACK | typeof NG_IS_LOCK_CALLBACK | typeof NG_LOCK_SIGNAL | typeof NG_LOCK_SUBJECT;
export const NG_LOCK_LOCKED_CLASS = 'ng-lock-locked';

/**
 * Uses the provided "selector" to find with "querySelector()" and apply the lockClass on the founded element.
 * @param {string} selector A DOMString containing a selector to match.
 * @returns {NgLockElementFinder} Return a NgLockElementFinder function
 * @throws Error
 */
export const ngLockElementByQuerySelector: NgLockElementFunction = (selector: string): NgLockElementFinder => {
    return (_self: any, _args: any[]): Element => {
        if (!selector) {
            throw new Error('selector is required');
        }
        const el = document.querySelector(selector);
        if (el) {
            return el;
        } else {
            throw new Error('Element not found');
        }
    };
};

/**
 * Uses a function argument for apply the lockClass. If provided a argsIndex use the specific argument, otherwise
 * search an argument with a target property that is a HTMLElement
 * @param {number} argsIndex (optional) index of the argument that is HTMLElement or contains target property (also a HTMLElement)
 * @returns {NgLockElementFinder} Return a NgLockElementFinder function
 * @throws Error
 */
export const ngLockElementByTargetEventArgument: NgLockElementFunction = (argsIndex?: number): NgLockElementFinder => {
    return (_self: any, args: any[]): Element => {
        if (!args || args.length <= 0) {
            throw new Error('Method without arguments');
        }
        let arg: any;
        if (typeof argsIndex === 'number') {
            if (argsIndex < 0) {
                throw new Error('argsIndex must be grater than or equal 0');
            } else {
                if (args.length - 1 < argsIndex) {
                    throw new Error('argsIndex grater than arguments length');
                }
                arg = args[argsIndex];
                if ((arg as MouseEvent).currentTarget instanceof HTMLElement) {
                    return arg.currentTarget;
                }
                if ((arg as MouseEvent).target instanceof HTMLElement) {
                    return arg.target;
                }
                if (arg instanceof HTMLElement) {
                    return arg;
                }
                throw new Error('Argument not an HTMLElement or with target, currentTarget property');
            }
        } else {
            arg = args.find(_arg => (_arg as MouseEvent).currentTarget instanceof HTMLElement);
            if (arg) {
                return arg.currentTarget;
            }
            arg = args.find(_arg => (_arg as MouseEvent).target instanceof HTMLElement);
            if (arg) {
                return arg.target;
            }
            arg = args.find(_arg => _arg instanceof HTMLElement);
            if (arg) {
                return arg;
            }
            throw new Error('Argument not found');
        }
    };
};

/**
 * Apply lockClass to a component property that must be a HTMLElement or element with Angular nativeElement (also a HTMLElement)
 * @param {string} property The property name of the component
 * @returns {NgLockElementFinder} Return a NgLockElementFinder function
 * @throws Error
 */
export const ngLockElementByComponentProperty: NgLockElementFunction = (property: string): NgLockElementFinder => {
    return (self: any, _args: any[]): Element => {
        if (!property) {
            throw new Error('Property is required');
        }
        const prop = self[property];
        if (prop) {
            if (prop instanceof HTMLElement) {
                return prop;
            }
            if (prop.nativeElement instanceof HTMLElement) {
                return prop.nativeElement;
            }
            throw new Error('Property must be a HTMLElement or object with nativeElement (also HTMLElement)');
        } else {
            throw new Error('Property not found');
        }
    };
};

/**
 * ngLock options
 *  - maxCall: Max number of the calls beyond which the method is locked
 *  - unlockTimeout: Max time (in millisecond) to lock function
 *  - lockElementFunction: function for find the HTMLElement for apply the lockClass
 *  - lockClass: CSS class applied when the method is locked
 *  - returnLastResultWhenLocked: if true, when the method is locked the last result is returned, otherwise return undefined
 *  - unlockOnPromiseResolve: if true, when a locked method return a Promise, the method is automatically unlock when the Promise is resolved
 *  - unlockOnObservableChanges: if true, when a locked method return a subscription, the method is automatically unlock when the observable changes
 *  - debug: if true, the decorator log into the console some info
 * @see NgLockDefaultOption for the default value
 */
export interface NgLockOption {
    maxCall?: number,
    unlockTimeout?: number | null;
    lockElementFunction?: NgLockElementFinder;
    lockClass?: string;
    returnLastResultWhenLocked?: boolean;
    unlockOnPromiseResolve?: boolean;
    unlockOnObservableChanges?: boolean;
    debug?: boolean;
}

/**
 * ngLock default options
 * @see NgLockOption
 */
export const NgLockDefaultOption: NgLockOption = {
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

        let _options: NgLockOption;
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
                elementToLock.classList.remove(_options.lockClass);
            }
            if (_options.unlockTimeout && timeoutHandle) {
                clearTimeout(timeoutHandle);
            }

            ngLockSignal.set(false);
            ngLockSubject.next(false);
        };

        const ngIsLockCallback = (): boolean => {
            return callCounter >= (_options as any)?.maxCall;
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
                    elementToLock.classList.add(_options.lockClass);
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
                [NG_UNLOCK_CALLBACK]: ngUnlockCallback,
                [NG_IS_LOCK_CALLBACK]: ngIsLockCallback,
                [NG_LOCK_SIGNAL]: () => ngLockSignal.asReadonly(),
                [NG_LOCK_SUBJECT]: () => ngLockSubject.asObservable(),
            }, enumerable: true, writable: false
        });

        return descriptor;
    };
}

/**
 * Unlock a locked function by ngLock() decorator
 * @param {NgLockFunction} methodToUnlock The function to unlock
 * @param {string} reason The reason for the log
 * @return {void}
 * @throws Error
 */
export function ngUnlock(methodToUnlock: NgLockFunction, reason?: string): void {
    const callback = ngCallbacks(methodToUnlock, NG_UNLOCK_CALLBACK);
    callback(reason);
}

/**
 * Unlock all locked functions by ngLock() decorator
 * @param {any} component The component instance (this)
 * @return {void}
 */
export function ngUnlockAll(component: any): void {
    Object.getOwnPropertyNames(Object.getPrototypeOf(component)).forEach(key => {
        const prop = component[key];
        if (typeof prop === 'function' && typeof prop['ngLock'] === 'object' && typeof prop['ngLock'][NG_UNLOCK_CALLBACK] === 'function') {
            prop['ngLock'][NG_UNLOCK_CALLBACK]('ngUnlockAll');
        }
    });
}

/**
 * Return true if the provided function is locked
 * @param {NgLockFunction} methodToCheck The method to check
 * @return {boolean}
 * @throws Error
 */
export function ngIsLock(methodToCheck: NgLockFunction): boolean {
    const callback = ngCallbacks(methodToCheck, NG_IS_LOCK_CALLBACK);
    return callback();
}

/**
 * Return a Signal for the given function on the lock status (locked/unlocked)
 * @param {NgLockFunction} method The function
 * @return {Signal<boolean>}
 */
export function ngLockSignal(method: NgLockFunction): Signal<boolean> {
    const callback = ngCallbacks(method, NG_LOCK_SIGNAL);
    return callback();
}

/**
 * Return an Observable for the given function on the lock status (locked/unlocked)
 * @param {NgLockFunction} method The function
 * @return {Observable<boolean>}
 */
export function ngLockObservable(method: NgLockFunction): Observable<boolean> {
    const callback = ngCallbacks(method, NG_LOCK_SUBJECT);
    return callback();
}

/**
 * Return the provided NG_CALLBACKS
 * @param {NgLockFunction} method The function to return the unlock callback
 * @param {NG_CALLBACKS} callback The NG_CALLBACKS
 * @return {NgLockFunction} Return the NG_CALLBACKS
 * @throws Error
 */
export function ngCallbacks(method: NgLockFunction, callback: NG_CALLBACKS): NgLockFunction {
    if (!(method instanceof Function)) {
        throw new Error('"method" param must be a function.');
    }
    if (callback !== NG_UNLOCK_CALLBACK && callback !== NG_IS_LOCK_CALLBACK && callback !== NG_LOCK_SIGNAL && callback !== NG_LOCK_SUBJECT) {
        throw new Error(`"callback" param "${callback}" must be a NG_CALLBACKS.`);
    }
    if (typeof (method as any)['ngLock'] !== 'object') {
        throw new Error(`"method" param (function ${method.name}) must be a @ngLock() decorated function.`);
    }
    if (typeof (method as any)['ngLock'][callback as any] !== 'function') {
        throw new Error(`"method" param (function ${method.name}) must be a @ngLock() decorated function with "${callback}".`);
    }
    return (method as any)['ngLock'][callback];
}
