import { HttpContext, HttpContextToken } from "@angular/common/http";

export type NgLockContext = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    methodToUnlock?: Function;
};

export const NG_LOCK_CONTEXT = new HttpContextToken<NgLockContext>(() => ({}));

export const withNgLockContext = (value: NgLockContext, context: HttpContext = new HttpContext()) => context.set(NG_LOCK_CONTEXT, value)