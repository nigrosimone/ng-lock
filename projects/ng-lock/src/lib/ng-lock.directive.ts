import { DestroyRef, Directive, ElementRef, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgLockFunction } from './ng-lock-types';
import { ngLockObservable, ngLockOption } from './ng-lock.decorator';

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
                this.eleRef.nativeElement.classList.add(option.lockClass);
                this.eleRef.nativeElement.setAttribute('disabled', 'disabled');
                this.eleRef.nativeElement.setAttribute('aria-disabled', 'true');
            } else {
                this.eleRef.nativeElement.classList.remove(option.lockClass);
                this.eleRef.nativeElement.removeAttribute('disabled')
                this.eleRef.nativeElement.removeAttribute('aria-disabled');
            }
        })
    }
}