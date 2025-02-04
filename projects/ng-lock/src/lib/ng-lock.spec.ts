import { Component, ElementRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ngLock } from './ng-lock.decorator';
import { NgLockModule } from './ng-lock.module';
import { NG_CALLBACKS, NG_LOCK_LOCKED_CLASS, NG_UNLOCK_CALLBACK } from './ng-lock-types';
import { ngCallbacks, ngIsLock, ngUnlock } from './ng-lock-utils';
import { ngLockElementByComponentProperty, ngLockElementByQuerySelector, ngLockElementByTargetEventArgument } from './ng-lock-element-finder';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('NgLock Component', () => {
    it('ngLockElementByQuerySelector', () => {
        @Component({
            template: '<button (click)="onClick()" id="button" #button>{{value}}</button>', imports: [NgLockModule]
        })
        class TestComponent {
            @ViewChild('button') button!: ElementRef<HTMLElement>;
            value = 0;
            @ngLock({
                lockElementFunction: ngLockElementByQuerySelector('button')
            })
            onClick() {
                this.value++;
            }
            unlock() {
                ngUnlock(this.onClick);
            }
        }
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        const element = fixture.nativeElement as HTMLElement;
        const component = fixture.componentInstance;

        expect(element.textContent).toBe('0');
        expect(ngIsLock(component.onClick)).toBe(false);
        component.onClick();
        fixture.detectChanges();
        expect(component.button.nativeElement.classList.contains(NG_LOCK_LOCKED_CLASS)).toBe(true);
        expect(element.textContent).toBe('1');
        component.onClick();
        fixture.detectChanges();
        expect(element.textContent).toBe('1');
        expect(ngIsLock(component.onClick)).toBe(true);
        component.unlock();
        fixture.detectChanges();
        expect(component.button.nativeElement.classList.contains(NG_LOCK_LOCKED_CLASS)).toBe(false);
        expect(element.className).toBe('');
        component.onClick();
        fixture.detectChanges();
        expect(element.textContent).toBe('2');
    });


    it('ngLockElementByComponentProperty', () => {
        @Component({
            template: '<button (click)="onClick()" #button>{{value}}</button>', imports: [NgLockModule]
        })
        class TestComponent {
            @ViewChild('button') button!: ElementRef<HTMLElement>;
            value = 0;
            @ngLock({
                lockElementFunction: ngLockElementByComponentProperty('button')
            })
            onClick() {
                this.value++;
            }
            unlock() {
                ngUnlock(this.onClick);
            }
        }
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        const element = fixture.nativeElement as HTMLElement;
        const component = fixture.componentInstance;

        fixture.detectChanges();
        expect(element.textContent).toBe('0');
        component.onClick();
        fixture.detectChanges();
        expect(element.textContent).toBe('1');
        component.onClick();
        fixture.detectChanges();
        expect(element.textContent).toBe('1');
        component.unlock();
        fixture.detectChanges();
        expect(element.className).toBe('');
        component.onClick();
        fixture.detectChanges();
        expect(element.textContent).toBe('2');
    });


    it('ngLockElementByTargetEventArgument', () => {
        @Component({
            template: '<button (click)="onClick()" #button>{{value}}</button>', imports: [NgLockModule]
        })
        class TestComponent {
            @ViewChild('button') button!: ElementRef<HTMLElement>;
            value = 0;
            @ngLock({
                lockElementFunction: ngLockElementByTargetEventArgument()
            })
            onClick(_: any) {
                this.value++;
            }
            unlock() {
                ngUnlock(this.onClick);
            }
        }
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        const element = fixture.nativeElement as HTMLElement;
        const component = fixture.componentInstance;

        fixture.detectChanges();
        expect(element.textContent).toBe('0');
        component.onClick({ target: component.button.nativeElement });
        fixture.detectChanges();
        expect(element.textContent).toBe('1');
        component.onClick({ target: component.button.nativeElement });
        fixture.detectChanges();
        expect(element.textContent).toBe('1');
        component.unlock();
        fixture.detectChanges();
        expect(element.className).toBe('');
        component.onClick({ target: component.button.nativeElement });
        fixture.detectChanges();
        expect(element.textContent).toBe('2');
    });


    it('unlockTimeout', async () => {
        @Component({
            template: '<button (click)="onClick()" #button>{{value}}</button>', imports: [NgLockModule]
        })
        class TestComponent {
            @ViewChild('button') button!: ElementRef<HTMLElement>;
            value = 0;
            @ngLock({
                lockElementFunction: null as any,
                lockClass: null as any,
                returnLastResultWhenLocked: true,
                unlockTimeout: 1,
                debug: true
            })
            onClick(_: any) {
                this.value++;
            }
        }
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        const element = fixture.nativeElement as HTMLElement;
        const component = fixture.componentInstance;


        fixture.detectChanges();
        expect(element.textContent).toBe('0');
        component.onClick({ target: component.button.nativeElement });
        fixture.detectChanges();
        expect(element.textContent).toBe('1');
        component.onClick({ target: component.button.nativeElement });
        fixture.detectChanges();
        expect(element.textContent).toBe('1');

        await sleep(1);

        fixture.detectChanges();
        expect(element.className).toBe('');
        component.onClick({ target: component.button.nativeElement });
        fixture.detectChanges();
        expect(element.textContent).toBe('2');
    });

    it('Promise', async () => {
        @Component({
            template: '<button (click)="onClick()" #button>test</button>', imports: [NgLockModule]
        })
        class TestComponent {
            @ViewChild('button') button!: ElementRef<HTMLElement>;
            @ngLock()
            async onClick(_: any) {
                await sleep(1);
                return true;
            }
        }
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        const component = fixture.componentInstance;

        component.onClick({ target: component.button.nativeElement });
        fixture.detectChanges();
        expect(component.button.nativeElement.classList.contains(NG_LOCK_LOCKED_CLASS)).toBe(true);
        await sleep(5);
        expect(component.button.nativeElement.classList.contains(NG_LOCK_LOCKED_CLASS)).toBe(false);
    });

    it('directive', async () => {
        @Component({
            template: '<button (click)="onClick()" #button>test</button><input #input [ngLock]="onClick">', imports: [NgLockModule]
        })
        class TestComponent {
            @ViewChild('button') button!: ElementRef<HTMLElement>;
            @ViewChild('input') input!: ElementRef<HTMLInputElement>;
            @ngLock()
            async onClick(_: any) {
                await sleep(1);
                return true;
            }
        }
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        const component = fixture.componentInstance;

        component.onClick({ target: component.button.nativeElement });
        fixture.detectChanges();
        expect(component.button.nativeElement.classList.contains(NG_LOCK_LOCKED_CLASS)).toBe(true);
        expect(component.input.nativeElement.classList.contains(NG_LOCK_LOCKED_CLASS)).toBe(true);
        await sleep(5);
        expect(component.button.nativeElement.classList.contains(NG_LOCK_LOCKED_CLASS)).toBe(false);
        expect(component.input.nativeElement.classList.contains(NG_LOCK_LOCKED_CLASS)).toBe(false);
    });
});


describe('NgLock Decorator', () => {
    it('test default options', () => {
        const _ngLock = ngLock();

        let count = 0;

        const descriptor = {
            value: (_: any) => {
                count++;
                return count;
            }
        };

        _ngLock(null as any, 'test', descriptor);

        const el = document.createElement('DIV')

        expect(descriptor.value(el)).toBe(1);
        expect(descriptor.value(el)).toBe(undefined as any);
    });

    it('test maxCall', () => {
        const _ngLock = ngLock({ maxCall: 2 });

        let count = 0;

        const descriptor = {
            value: (_: any) => {
                count++;
                return count;
            }
        };

        _ngLock(null as any, 'test', descriptor);

        const el = document.createElement('DIV')

        expect(descriptor.value(el)).toBe(1);
        expect(descriptor.value(el)).toBe(2);
        expect(descriptor.value(el)).toBe(undefined as any);
    });

    it('test maxCall with returnLastResultWhenLocked', () => {
        const _ngLock = ngLock({ maxCall: 2, returnLastResultWhenLocked: true });

        let count = 0;

        const descriptor = {
            value: (_: any) => {
                count++;
                return count;
            }
        };

        _ngLock(null as any, 'test', descriptor);

        const el = document.createElement('DIV')

        expect(descriptor.value(el)).toBe(1);
        expect(descriptor.value(el)).toBe(2);
        expect(descriptor.value(el)).toBe(2);
    });
});


describe('ngLockElementByTargetEventArgument', () => {
    it('Method without arguments', () => {
        const fn = ngLockElementByTargetEventArgument();
        expect(function () { fn(null, null as any); }).toThrow(new Error("Method without arguments"));
    });
    it('Argument not found', () => {
        const fn = ngLockElementByTargetEventArgument();
        expect(function () { fn(null, [{}]); }).toThrow(new Error("Argument not found"));
    });
    it('argsIndex must be grater than or equal 0', () => {
        const fn = ngLockElementByTargetEventArgument(-1);
        expect(function () { fn(null, [{}]); }).toThrow(new Error("argsIndex must be grater than or equal 0"));
    });
    it('argsIndex grater than arguments length', () => {
        const fn = ngLockElementByTargetEventArgument(2);
        expect(function () { fn(null, [{}]); }).toThrow(new Error("argsIndex grater than arguments length"));
    });
    it('Argument not an HTMLElement or with target, currentTarget property 1', () => {
        const fn = ngLockElementByTargetEventArgument(0);
        expect(function () { fn(null, [{}]); }).toThrow(new Error("Argument not an HTMLElement or with target, currentTarget property"));
    });
    it('Argument not an HTMLElement or with target, currentTarget property 2', () => {
        const fn = ngLockElementByTargetEventArgument(0);
        expect(function () { fn(null, [{ target: true }]); }).toThrow(new Error("Argument not an HTMLElement or with target, currentTarget property"));
    });
    it('Argument not an HTMLElement or with target, currentTarget property 3', () => {
        const fn = ngLockElementByTargetEventArgument(0);
        expect(function () { fn(null, [{ currentTarget: true }]); }).toThrow(new Error("Argument not an HTMLElement or with target, currentTarget property"));
    });
    it('Argument with el 1', () => {
        const el = document.createElement('DIV')
        const fn = ngLockElementByTargetEventArgument(0);
        expect(fn(null, [el])).toBe(el);
    });
    it('Argument with el 2', () => {
        const el = document.createElement('DIV')
        const fn = ngLockElementByTargetEventArgument(0);
        expect(fn(null, [{ target: el }])).toBe(el);
    });
    it('Argument with el 3', () => {
        const el = document.createElement('DIV')
        const fn = ngLockElementByTargetEventArgument(0);
        expect(fn(null, [{ currentTarget: el }])).toBe(el);
    });
    it('Argument with el 4', () => {
        const el = document.createElement('DIV')
        const fn = ngLockElementByTargetEventArgument();
        expect(fn(null, [{ target: el }])).toBe(el);
    });
    it('Argument with el 5', () => {
        const el = document.createElement('DIV')
        const fn = ngLockElementByTargetEventArgument();
        expect(fn(null, [{ currentTarget: el }])).toBe(el);
    });
    it('Argument with el 6', () => {
        const el = document.createElement('DIV')
        const fn = ngLockElementByTargetEventArgument();
        expect(fn(null, [el])).toBe(el);
    });
});


describe('ngLockElementByQuerySelector', () => {
    it('selector is required', () => {
        const fn = ngLockElementByQuerySelector();
        expect(function () { fn(null, null as any); }).toThrow(new Error("selector is required"));
    });
    it('Element not found', () => {
        const fn = ngLockElementByQuerySelector('#xxxxxxxxxxxxxxxxxxxxxxx');
        expect(function () { fn(null, null as any); }).toThrow(new Error("Element not found"));
    });
    it('Argument with el', () => {
        const fn = ngLockElementByQuerySelector('body');
        expect(fn(null, null as any)).toBe(document.querySelector('body') as any);
    });
});

describe('ngLockElementByComponentProperty', () => {
    it('Property is required', () => {
        const fn = ngLockElementByComponentProperty();
        expect(function () { fn({}, null as any); }).toThrow(new Error("Property is required"));
    });
    it('Element not found', () => {
        const fn = ngLockElementByComponentProperty('xxxxxxxxxxxxxxxxxxxxxxx');
        expect(function () { fn({}, null as any); }).toThrow(new Error("Property not found"));
    });
    it('Property not found', () => {
        const fn = ngLockElementByComponentProperty('test');
        expect(function () { fn({ test: null }, null as any); }).toThrow(new Error("Property not found"));
    });
    it('Property must be a HTMLElement or object with nativeElement (also HTMLElement)', () => {
        const fn = ngLockElementByComponentProperty('test');
        expect(function () { fn({ test: { nativeElement: null } }, null as any); }).toThrow(new Error("Property must be a HTMLElement or object with nativeElement (also HTMLElement)"));
    });
    it('Argument with el 1', () => {
        const el = document.createElement('DIV')
        const fn = ngLockElementByComponentProperty('test');
        expect(fn({ test: el }, null as any)).toBe(el);
    });
    it('Argument with el 2', () => {
        const el = document.createElement('DIV')
        const fn = ngLockElementByComponentProperty('test');
        expect(fn({ test: { nativeElement: el } }, null as any)).toBe(el);
    });
});


describe('ngUnlockCallback', () => {
    it('"method" param must be a function', () => {
        expect(function () { ngCallbacks(null as any, NG_UNLOCK_CALLBACK); }).toThrow(new Error('"method" param must be a function.'));
    });
    it('"method" param (function f) must be a @ngLock() decorated function.', () => {
        const f = () => { };
        expect(function () { ngCallbacks(f, NG_UNLOCK_CALLBACK); }).toThrow(new Error('"method" param (function f) must be a @ngLock() decorated function.'));
    });
    it('"callback" param "TEST" must be a NG_CALLBACKS.', () => {
        const f = () => { };
        expect(function () { ngCallbacks(f, 'TEST' as NG_CALLBACKS); }).toThrow(new Error('"callback" param "TEST" must be a NG_CALLBACKS.'));
    });
});
