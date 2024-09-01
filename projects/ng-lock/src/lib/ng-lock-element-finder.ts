import type { NgLockElementFinder, NgLockElementFunction } from "./ng-lock-types";

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
