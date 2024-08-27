import { HttpContext, HttpContextToken } from "@angular/common/http";
import { NgLockFunction } from "./ng-lock-types";

/**
 * Unlock the given method on HTTP response
 */
export const NG_LOCK_CONTEXT = new HttpContextToken<NgLockFunction>(() => (function () { }));

/**
 * Return HttpContextToken for unlock the given method on HTTP response
 * @param {NgLockFunction} methodToUnlock the method to unlock
 * @param {HttpContext} context current context
 * @returns {HttpContext}
 */
export const withNgLockContext = (methodToUnlock: NgLockFunction, context: HttpContext = new HttpContext()) => context.set(NG_LOCK_CONTEXT, methodToUnlock)