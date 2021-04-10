import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ngLock, ngUnlock, ngLockElementByQuerySelector } from './ng-lock.decorator';


@Component({template: '<button (click)="onClick()" id="button">{{value}}</button>'})
class TestComponent {
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
describe('NgLock', () => {

    let fixture: ComponentFixture<TestComponent>;
    let debugElement: DebugElement;
    let element: HTMLElement;
    let component: TestComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
          declarations: [TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
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