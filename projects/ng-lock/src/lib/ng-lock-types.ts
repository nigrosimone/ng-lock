/* eslint-disable @typescript-eslint/no-explicit-any */

export type NgLockElementFunction = (...args: any[]) => NgLockElementFinder;
export type NgLockElementFinder = (self: any, args: any[]) => Element;
export type NgLockFunction = (...args: any[]) => any;

export const NG_UNLOCK_CALLBACK = 'ngUnlockCallback';
export const NG_IS_LOCK_CALLBACK = 'ngIsLockCallback';
export const NG_LOCK_SIGNAL = 'ngLockSignal';
export const NG_LOCK_SUBJECT = 'ngLockSubject';
export type NG_CALLBACKS = typeof NG_UNLOCK_CALLBACK | typeof NG_IS_LOCK_CALLBACK | typeof NG_LOCK_SIGNAL | typeof NG_LOCK_SUBJECT;
export const NG_LOCK_LOCKED_CLASS = 'ng-lock-locked';

export interface NgLockAllOption {
    maxCall: number,
    unlockTimeout: number | null;
    lockElementFunction: NgLockElementFinder;
    lockClass?: string;
    returnLastResultWhenLocked: boolean;
    unlockOnPromiseResolve: boolean;
    unlockOnObservableChanges: boolean;
    debug: boolean;
}

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
export type NgLockOption = Partial<NgLockAllOption>
