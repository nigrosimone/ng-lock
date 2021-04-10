import { Component, DebugElement, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ngLock, ngUnlock, ngLockElementByQuerySelector, ngLockElementByComponentProperty, ngLockElementByTargetEventArgument, NG_LOCK_LOCKED_CLASS } from './ng-lock.decorator';


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