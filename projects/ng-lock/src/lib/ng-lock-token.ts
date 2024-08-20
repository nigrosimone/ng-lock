import { HttpContext, HttpContextToken } from "@angular/common/http";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type NgLockContext = Function;

export const NG_LOCK_CONTEXT = new HttpContextToken<NgLockContext>(() => (function () { }));

export const withNgLockContext = (value: NgLockContext, context: HttpContext = new HttpContext()) => context.set(NG_LOCK_CONTEXT, value)