/* eslint-disable @typescript-eslint/no-explicit-any */

export type NgLockElementFunction = (...args: any[]) => NgLockElementFinder;
export type NgLockElementFinder = (self: any, args: any[]) => Element;
export type NgLockFunction = (...args: any[]) => any;