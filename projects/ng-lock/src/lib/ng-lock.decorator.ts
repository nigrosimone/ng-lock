export const NG_UNLOCK_CALLBACK = "ngUnlockCallback";
export const NG_LOCK_LOCKED_CLASS = 'ng-lock-locked'

export type NgLockDecoratedFunction = {
    [NG_UNLOCK_CALLBACK]?: () => void
}

export type NgLockElementFunction = (...args: any[]) => NgLockElementFinder;
export type NgLockElementFinder = (self: any, args: any[]) => Element;

/**
 * Uses the provided "selector" to find with "querySelector()" and apply the lockClass on the founded element.
 * @param selector A DOMString containing a selector to match.
 * @returns Return a NgLockElementFinder function
 */
export const ngLockElementByQuerySelector: NgLockElementFunction = (selector: string): NgLockElementFinder => {
    return (self: any, args: any[]): Element => {
        if (!selector) {
            throw new Error('selector is required');
        }
        const el = document.querySelector(selector);
        if (el) {
            return el;
        } else {
            throw new Error('Element not found');
        }
    }
};

/**
 * Uses a function argument for apply the lockClass. If provided a argsIndex use the specific argument, otherwise
 * search an argument with a target property that is a HTMLElement
 * @param argsIndex (optional) index of the argument that is HTMLElement or contains target property (also a HTMLElement)
 * @returns Return a NgLockElementFinder function
 */
export const ngLockElementByTargetEventArgument: NgLockElementFunction = (argsIndex?: number): NgLockElementFinder => {
    return (self: any, args: any[]): Element => {
        if (!args || args.length <= 0) {
            throw new Error('Method without arguments');
        }
        let arg: any;
        if (argsIndex) {
            if (argsIndex < 0) {
                throw new Error('argsIndex muth be grater than or equal 0');
            }
            if (args.length - 1 < argsIndex) {
                throw new Error('argsIndex grater than arguments length');
            }
            arg = args[argsIndex];
            if (arg instanceof HTMLElement) {
                return arg;
            }
            if (!arg.target) {
                throw new Error('Argument not a HTMLElement and without a target element');
            }
            if (!(arg.target instanceof HTMLElement)) {
                throw new Error('Argument with target property but not an HTMLElement');
            }
            return arg.target;
        } else {
            arg = args.find(arg => arg.target instanceof HTMLElement);
            if (arg) {
                return arg.target;
            } else {
                throw new Error('Argument not found');
            }
        }
    }
};

/**
 * Apply lockClass to a component property that must be a HTMLElement or element with Angular nativeElement (also a HTMLElement)
 * @param property The property name of the component
 * @returns Return a NgLockElementFinder function
 */
export const ngLockElementByComponentProperty: NgLockElementFunction = (property: string): NgLockElementFinder => {
    return (self: any, args: any[]): Element => {
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
    }
};

/**
 * ngLock options
 *  - maxCall: Max number of the calls beyond which the method is locked
 *  - unlockTimeout: Max time (in millisecond) to lock function
 *  - lockElementFunction: function for find the HTMLElement for apply the lockClass
 *  - lockClass: CSS class applied when the method is locked
 *  - returnLastResultWhenLocked: if true, when the method is locked the last result is returned, otherwise return undefined
 *  - debug: if true, the decorator log into the console some info
 * @see NgLockDefaultOption for the default value
 */
export interface NgLockOption {
    maxCall?: number,
    unlockTimeout?: number;
    lockElementFunction?: NgLockElementFinder;
    lockClass?: string;
    returnLastResultWhenLocked?: boolean;
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
    debug: false
}

/**
 * Lock the decorated function
 * @param options (optional) NgLockOption
 * @return Return a MethodDecorator
 */
export function ngLock(options?: NgLockOption): MethodDecorator {
    return function (target: Function, key: string, descriptor: any) {

        let _options: NgLockOption;
        if (!options) {
            _options = { ...NgLockDefaultOption };
        } else {
            _options = { ...NgLockDefaultOption, ...options };
        }

        let callCounter: number = 0;
        let timeoutHandle: number = null;
        let elementToLock: Element = null;
        let lastResult: any = undefined;

        const originalMethod: any = descriptor.value;

        const ngLockLog = (...args: any[]): void => {
            if (_options.debug) {
                console.log(...args);
            }
        }

        const ngUnlockCallback = (): void => {
            ngLockLog(`NgLock: unlock method "${key}" at counter ${callCounter}`);
            callCounter = 0;
            if (_options.lockClass && elementToLock) {
                elementToLock.classList.remove(_options.lockClass);
            }
            if (_options.unlockTimeout && timeoutHandle) {
                clearTimeout(timeoutHandle);
            }
        };

        ngLockLog(`NgLock: decorate method "${key}"`);

        descriptor.value = function (...args: any[]) {

            if (callCounter >= _options.maxCall) {
                ngLockLog(`NgLock: method "${key}" locked at counter ${callCounter}`);
                if (_options.returnLastResultWhenLocked) {
                    return lastResult;
                }
                return;
            }
            callCounter++;

            if (_options.lockElementFunction) {
                elementToLock = _options.lockElementFunction(this, args);
            }
            if (callCounter >= _options.maxCall) {
                if (_options.lockClass && elementToLock) {
                    elementToLock.classList.add(_options.lockClass);
                }
            }

            lastResult = originalMethod.apply(this, args);
            ngLockLog(`NgLock: execute method "${key}" at counter ${callCounter}`);

            if (_options.unlockTimeout) {
                timeoutHandle = setTimeout(() => {
                    ngLockLog(`NgLock: timeout reached for method "${key}"`);
                    ngUnlockCallback();
                }, _options.unlockTimeout);
            }

            return lastResult;
        };

        Object.defineProperty(descriptor.value, NG_UNLOCK_CALLBACK, { value: ngUnlockCallback, enumerable: true, writable: false });

        return descriptor;
    };
}

/**
 * Unlock a locked function by @ngLock() decorator
 * @param fn The function to unlock
 * @return void
 * @throws Error
 */
export function ngUnlock(fn: Function): void {
    const unlockCallback = ngUnlockCallback(fn);
    unlockCallback();
}

/**
 * Return the function for unlock a locked function by @ngLock() decorator
 * @param fn The function to return the unlock callback
 * @return Return the unlock callback
 * @throws Error
 */
export function ngUnlockCallback(fn: Function): Function {
    if (!(fn instanceof Function)) {
        throw new Error('"fn" param must be a function.');
    }
    if (typeof fn[NG_UNLOCK_CALLBACK] !== 'function') {
        throw new Error(`"fn" param (function ${fn.name}) must be a @ngLock() decorated function.`);
    }
    return fn[NG_UNLOCK_CALLBACK];
}