import { Signal } from "@angular/core";
import { NG_CALLBACKS, NG_IS_LOCK_CALLBACK, NG_LOCK_OPTION, NG_LOCK_SIGNAL, NG_LOCK_SUBJECT, NG_UNLOCK_CALLBACK, NgLockAllOption, NgLockFunction, NgLockOption } from "./ng-lock-types";
import type { Observable, Subscriber } from "rxjs";

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
 * Return the option for the given function
 * @param {NgLockFunction} method The function
 * @return {NgLockAllOption}
 */
export function ngLockOption(method: NgLockFunction): NgLockAllOption {
    const callback = ngCallbacks(method, NG_LOCK_OPTION);
    return callback();
}

/**
 * Return an Observable for the given function on the lock status (locked/unlocked)
 * @param {NgLockFunction} method - The function
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
    if (callback !== NG_UNLOCK_CALLBACK && callback !== NG_IS_LOCK_CALLBACK && callback !== NG_LOCK_SIGNAL && callback !== NG_LOCK_SUBJECT && callback !== NG_LOCK_OPTION) {
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

/**
 * Add class and attribute on HTML element
 * @param {Element} elementToLock 
 * @param {NgLockOption} options 
 */
export const ngLockHtmlElement = (elementToLock: Element | null, options: NgLockOption) => {
    if (!elementToLock) {
        return;
    }
    if (options?.lockClass) elementToLock.classList.add(options.lockClass);
    elementToLock.setAttribute('disabled', 'disabled');
    elementToLock.setAttribute('aria-disabled', 'true');
}

/**
 * Remove class and attribute from HTML element
 * @param {Element} elementToLock 
 * @param {NgLockOption} options 
 */
export const ngUnLockHtmlElement = (elementToLock: Element | null, options: NgLockOption) => {
    if (!elementToLock) {
        return;
    }
    if (options?.lockClass) elementToLock.classList.remove(options.lockClass);
    elementToLock.removeAttribute('disabled');
    elementToLock.removeAttribute('aria-disabled');
}

/**
 * Check if value is a Promise
 */
export const isPromise = (value: any): value is Promise<unknown> => value && typeof value.finally === 'function' && typeof value.then === 'function' && value[Symbol.toStringTag] === 'Promise';

/**
 * Check if value is a destination partialObserver
 */
export const isObserver = (value: any): value is { destination: { partialObserver: Subscriber<unknown> } } => value && typeof value?.destination?.partialObserver === 'object';