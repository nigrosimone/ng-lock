import { DestroyRef, Directive, ElementRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgLockFunction } from './ng-lock-types';
import { ngLockHtmlElement, ngLockObservable, ngLockOption, ngUnLockHtmlElement } from './ng-lock.decorator';


/**
 * @ngModule NgLockModule
 *
 * @description
 *
 * The `ngLock` directive it's a Angular directive lock html element when a decorated method with `@ngLock` is running a task.
 *
 * @usageNotes
 *
 * ### Usage
 *
 * ```html
 * <input [ngLock]="myMethod" /><button (click)="myMethod($event)">Send</button>
 * ```
 * ```ts
 * @ngLock()
 * myMethod(event: MouseEvent){
 *  return new Promise(resolve => setTimeout(resolve, 5000));
 * }
 * ```
 */
@Directive({
    selector: '[ngLock]'
})
export class NgLockDirective implements OnInit {

    /**
     * @ngModule NgLockModule
     *
     * @description
     *
     * The `ngLock` directive it's a Angular directive lock html element when a decorated method with `@ngLock` is running a task.
     *
     * @usageNotes
     *
     * ### Usage
     *
     * ```html
     * <input [ngLock]="myMethod" /><button (click)="myMethod($event)">Send</button>
     * ```
     * ```ts
     * @ngLock()
     * myMethod(event: MouseEvent){
     *  return new Promise(resolve => setTimeout(resolve, 5000));
     * }
     * ```
     */
    @Input({ required: true }) ngLock!: NgLockFunction;

    constructor(
        private eleRef: ElementRef<HTMLElement>,
        private destroyRef: DestroyRef) {
    }

    ngOnInit(): void {
        const option = ngLockOption(this.ngLock)
        ngLockObservable(this.ngLock).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(status => {
            if (status) {
                ngLockHtmlElement(this.eleRef.nativeElement, option)
            } else {
                ngUnLockHtmlElement(this.eleRef.nativeElement, option)
            }
        })
    }
}