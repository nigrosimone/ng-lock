/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, DebugElement, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ngLock, ngUnlock, ngLockElementByQuerySelector, ngLockElementByComponentProperty, ngLockElementByTargetEventArgument, ngCallbacks, NG_UNLOCK_CALLBACK, NG_CALLBACKS, ngIsLock, ngUnlockAll } from './ng-lock.decorator';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

@Component({ template: '<button (click)="onClick()" id="button" #button>{{value}}</button>' })
// eslint-disable-next-line @angular-eslint/component-class-suffix
class TestComponent1 {
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
describe('NgLock: 1', () => {

    let fixture: ComponentFixture<TestComponent1>;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let component: TestComponent1;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestComponent1],
        });
        fixture = TestBed.createComponent(TestComponent1);
        debugElement = fixture.debugElement;
        element = debugElement.nativeElement;
        component = fixture.componentInstance;
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('test', () => {
        fixture.detectChanges();
        expect(element.textContent).toBe('0');
        expect(ngIsLock(component.onClick)).toBe(false);
        component.onClick();
        fixture.detectChanges();
        expect(element.textContent).toBe('1');
        component.onClick();
        fixture.detectChanges();
        expect(element.textContent).toBe('1');
        expect(ngIsLock(component.onClick)).toBe(true);
        component.unlock();
        fixture.detectChanges();
        expect(element.className).toBe('');
        component.onClick();
        fixture.detectChanges();
        expect(element.textContent).toBe('2');
    });
});




@Component({ template: '<button (click)="onClick()" #button>{{value}}</button>' })
// eslint-disable-next-line @angular-eslint/component-class-suffix
class TestComponent2 {
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
describe('NgLock: 2', () => {

    let fixture: ComponentFixture<TestComponent2>;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let component: TestComponent2;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestComponent2],
        });
        fixture = TestBed.createComponent(TestComponent2);
        debugElement = fixture.debugElement;
        element = debugElement.nativeElement;
        component = fixture.componentInstance;
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('test', () => {
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
});




@Component({ template: '<button (click)="onClick()" #button>{{value}}</button>' })
// eslint-disable-next-line @angular-eslint/component-class-suffix
class TestComponent3 {
    @ViewChild('button') button!: ElementRef<HTMLElement>;

    value = 0;

    @ngLock({
        lockElementFunction: ngLockElementByTargetEventArgument()
    })
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    onClick(e: any) {
        this.value++;
    }

    unlock() {
        ngUnlock(this.onClick);
    }
}
describe('NgLock: 3', () => {

    let fixture: ComponentFixture<TestComponent3>;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let component: TestComponent3;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestComponent3],
        });
        fixture = TestBed.createComponent(TestComponent3);
        debugElement = fixture.debugElement;
        element = debugElement.nativeElement;
        component = fixture.componentInstance;
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('test', () => {
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
});




@Component({ template: '<button (click)="onClick()" #button>{{value}}</button>' })
// eslint-disable-next-line @angular-eslint/component-class-suffix
class TestComponent4 {
    @ViewChild('button') button!: ElementRef<HTMLElement>;

    value = 0;

    @ngLock({
        lockElementFunction: null as any,
        lockClass: null as any,
        returnLastResultWhenLocked: true,
        unlockTimeout: 1,
        debug: true
    })
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    onClick(e: any) {
        this.value++;
    }
}
describe('NgLock: 4', () => {

    let fixture: ComponentFixture<TestComponent4>;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let component: TestComponent4;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestComponent4],
        });
        fixture = TestBed.createComponent(TestComponent4);
        debugElement = fixture.debugElement;
        element = debugElement.nativeElement;
        component = fixture.componentInstance;
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it('test', async () => {
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
});






describe('NgLock', () => {
    it('test 1', () => {
        const _ngLock = ngLock();

        let count = 0;

        const descriptor = {
            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
            value: (x: any) => {
                count++;
                return count;
            }
        };

        _ngLock(null as any, 'test', descriptor);

        const el = document.createElement('DIV')

        expect(descriptor.value(el)).toBe(1);
        expect(descriptor.value(el)).toBe(undefined as any);
    });

    it('test 2', () => {
        const _ngLock = ngLock({ maxCall: 2 });

        let count = 0;

        const descriptor = {
            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
            value: (x: any) => {
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

    it('test 3', () => {
        const _ngLock = ngLock({ maxCall: 2, returnLastResultWhenLocked: true });

        let count = 0;

        const descriptor = {
            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
            value: (x: any) => {
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
    it('Element not foun', () => {
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
    it('"fn" param must be a function', () => {
        expect(function () { ngCallbacks(null as any, NG_UNLOCK_CALLBACK); }).toThrow(new Error('"fn" param must be a function.'));
    });
    it('"fn" param (function f) must be a @ngLock() decorated function.', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const f = () => { };
        expect(function () { ngCallbacks(f, NG_UNLOCK_CALLBACK); }).toThrow(new Error('"fn" param (function f) must be a @ngLock() decorated function.'));
    });
    it('"callback" param "TEST" must be a NG_CALLBACKS.', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const f = () => { };
        expect(function () { ngCallbacks(f, 'TEST' as NG_CALLBACKS); }).toThrow(new Error('"callback" param "TEST" must be a NG_CALLBACKS.'));
    });
});

describe('ngUnlockAll', () => {
    it('ngUnlockAll', () => {

        let test1 = false;
        let test2 = false;
        const self = {
            test1: () => null,
            test2: () => null,
            test3: null
        };
        Object.defineProperty(self.test1, NG_UNLOCK_CALLBACK, { value: () => test1 = true, enumerable: true, writable: false });
        Object.defineProperty(self.test2, NG_UNLOCK_CALLBACK, { value: () => test2 = true, enumerable: true, writable: false });

        ngUnlockAll(self);

        expect(test1).toBe(true);
        expect(test2).toBe(true);
    });
    
});