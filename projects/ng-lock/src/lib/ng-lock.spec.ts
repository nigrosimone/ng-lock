import { Component, DebugElement, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ngLock, ngUnlock, ngLockElementByQuerySelector, ngLockElementByComponentProperty, ngLockElementByTargetEventArgument, NG_LOCK_LOCKED_CLASS } from './ng-lock.decorator';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

@Component({template: '<button (click)="onClick()" id="button" #button>{{value}}</button>'})
class TestComponent1 {
    @ViewChild('button') button: ElementRef<HTMLElement>;

    value = 0;

    @ngLock({
        lockElementFunction: ngLockElementByQuerySelector('button')
    })
    onClick(){
        this.value++;
    }

    unlock(){
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




@Component({template: '<button (click)="onClick()" #button>{{value}}</button>'})
class TestComponent2 {
    @ViewChild('button') button: ElementRef<HTMLElement>;
    
    value = 0;

    @ngLock({
        lockElementFunction: ngLockElementByComponentProperty('button')
    })
    onClick(){
        this.value++;
    }

    unlock(){
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




@Component({template: '<button (click)="onClick()" #button>{{value}}</button>'})
class TestComponent3 {
    @ViewChild('button') button: ElementRef<HTMLElement>;
    
    value = 0;

    @ngLock({
        lockElementFunction: ngLockElementByTargetEventArgument()
    })
    onClick(e){
        this.value++;
    }

    unlock(){
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
        component.onClick({target: component.button.nativeElement});
        fixture.detectChanges();
        expect(element.textContent).toBe('1');
        component.onClick({target: component.button.nativeElement});
        fixture.detectChanges();
        expect(element.textContent).toBe('1');
        component.unlock();
        fixture.detectChanges();
        expect(element.className).toBe('');
        component.onClick({target: component.button.nativeElement});
        fixture.detectChanges();
        expect(element.textContent).toBe('2');
    });
});




@Component({template: '<button (click)="onClick()" #button>{{value}}</button>'})
class TestComponent4 {
    @ViewChild('button') button: ElementRef<HTMLElement>;
    
    value = 0;

    @ngLock({
        lockElementFunction: null,
        lockClass: null,
        returnLastResultWhenLocked: true,
        unlockTimeout: 1
    })
    onClick(e){
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

    it('test', async(done) => {
        fixture.detectChanges();
        expect(element.textContent).toBe('0');
        component.onClick({target: component.button.nativeElement});
        fixture.detectChanges();
        expect(element.textContent).toBe('1');
        component.onClick({target: component.button.nativeElement});
        fixture.detectChanges();
        expect(element.textContent).toBe('1');

        await sleep(1);

        fixture.detectChanges();
        expect(element.className).toBe('');
        component.onClick({target: component.button.nativeElement});
        fixture.detectChanges();
        expect(element.textContent).toBe('2');

        done();
    });
});



describe('ngLockElementByTargetEventArgument', () => {
    it('Method without arguments', () => {
        const fn = ngLockElementByTargetEventArgument();
        expect( function(){ fn(null, null); } ).toThrow(new Error("Method without arguments"));
    }); 
    it('Argument not found', () => {
        const fn = ngLockElementByTargetEventArgument();
        expect( function(){ fn(null, [{}]); } ).toThrow(new Error("Argument not found"));
    });
    it('argsIndex muth be grater than or equal 0', () => {
        const fn = ngLockElementByTargetEventArgument(-1);
        expect( function(){ fn(null, [{}]); } ).toThrow(new Error("argsIndex muth be grater than or equal 0"));
    });
    it('argsIndex grater than arguments length', () => {
        const fn = ngLockElementByTargetEventArgument(2);
        expect( function(){ fn(null, [{}]); } ).toThrow(new Error("argsIndex grater than arguments length"));
    });
    it('Argument not a HTMLElement and without a target element', () => {
        const fn = ngLockElementByTargetEventArgument(0);
        expect( function(){ fn(null, [{}]); } ).toThrow(new Error("Argument not a HTMLElement and without a target element"));
    });
    it('Argument with target property but not an HTMLElement', () => {
        const fn = ngLockElementByTargetEventArgument(0);
        expect( function(){ fn(null, [{target: true}]); } ).toThrow(new Error("Argument with target property but not an HTMLElement"));
    });
});


describe('ngLockElementByQuerySelector', () => {
    it('selector is required', () => {
        const fn = ngLockElementByQuerySelector();
        expect( function(){ fn(null, null); } ).toThrow(new Error("selector is required"));
    });
    it('Element not foun', () => {
        const fn = ngLockElementByQuerySelector('#xxxxxxxxxxxxxxxxxxxxxxx');
        expect( function(){ fn(null, null); } ).toThrow(new Error("Element not found"));
    });
});

describe('ngLockElementByComponentProperty', () => {
    it('Property is required', () => {
        const fn = ngLockElementByComponentProperty();
        expect( function(){ fn({}, null); } ).toThrow(new Error("Property is required"));
    });
    it('Element not found', () => {
        const fn = ngLockElementByComponentProperty('xxxxxxxxxxxxxxxxxxxxxxx');
        expect( function(){ fn({}, null); } ).toThrow(new Error("Property not found"));
    });
    it('Property must be a HTMLElement or object with nativeElement (also HTMLElement)', () => {
        const fn = ngLockElementByComponentProperty('test');
        expect( function(){ fn({test: null}, null); } ).toThrow(new Error("Property not found"));
    });
});