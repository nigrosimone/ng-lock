import { DestroyRef, Directive, ElementRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgLockFunction } from './ng-lock-types';
import { ngLockHtmlElement, ngLockObservable, ngLockOption, ngUnLockHtmlElement } from './ng-lock.decorator';

@Directive({
    selector: '[ngLock]'
})
export class NgLockDirective implements OnInit {

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