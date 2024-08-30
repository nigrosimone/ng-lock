# NgLock [![Build Status](https://travis-ci.com/nigrosimone/ng-lock.svg?branch=main)](https://travis-ci.com/nigrosimone/ng-lock) [![Coverage Status](https://coveralls.io/repos/github/nigrosimone/ng-lock/badge.svg?branch=main)](https://coveralls.io/github/nigrosimone/ng-lock?branch=main) [![NPM version](https://img.shields.io/npm/v/ng-lock.svg)](https://www.npmjs.com/package/ng-lock)

Angular decorator for lock a function and user interface while a task running.

## Description

Ever faced the issue where users click a button multiple times, causing chaos in your application? Meet `ng-lock`, the Angular library designed to save the day. It offers a straightforward way to lock functions and the user interface while a task is running.

### Key Benefits:
1. *Prevents Multiple Clicks*: Ensures a function executes only once until it completes, avoiding redundant operations;
2. *User Interface Locking*: Disables UI elements to signal an ongoing process, enhancing user experience;
3. *Easy Integration*: Simple decorators to lock and unlock functions, reducing boilerplate code.

See the [stackblitz demo](https://stackblitz.com/edit/demo-ng-lock?file=src%2Fapp%2Fapp.component.ts).

## Get Started

*Step 1*: install `ng-lock`

```bash
npm i ng-lock
```

*Step 2*: Import `NgLockModule` into your app module, eg.:

```ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgLockModule } from 'ng-lock';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgLockModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  ],
})
export class AppModule { }
```

*Step 3*: Decorate a function with `@ngLock()` decorator, eg.:

```ts
import { Component, isDevMode, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of } from 'rxjs';
import {
  ngLock,
  ngUnlock,
  withNgLockContext,
  ngLockChanges,
  NgLockModule,
  ngLockSignal,
  ngLockObservable,
} from 'ng-lock';

const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));
const WAIT_TIME = 1500;

@Component({
  selector: 'app-root',
  template: `
    <h2>Examples</h2>
    <p>Sometime there is a need to lock the user interface while a task is running.</p>
    <hr />
    Disable the button on click and enable when <b>ngUnlock</b> is called<br>
    <button (click)="onClick($event)">Click me</button>
    <hr />
    Disable the button on click and enable when <b>HTTP</b> request is completed<br>
    <button (click)="onHttpRequest($event)">Click me</button>
    <hr />
    Disable the button on click and enable when <b>Observable</b> changes<br>
    <button (click)="onObservable($event)">Click me</button>
    <hr />
    Disable the button on click and enable when <b>Promise</b> is resolved<br>
    <button (click)="onAsync($event)">Click me</button><br>
    <em>Signal: {{ sigAsyncMethod() }}, Observable: {{ asyncMethod$ | async }}</em>
    <hr />
    Disable the button on click and enable when <b>Subscription</b> changes<br>
    <button (click)="onSubscription($event)">Click me</button>
    <hr />
    Disable the button on click and enable when <b>unlockTimeout</b> expire<br>
    <button (click)="onTimeout($event)">Click me</button><br>
    This input also depends on the lock state, see <b>ngLock</b> directive <br>
    <input type="text" [ngLock]="onTimeout" value="test">
    <hr />
  `,
  styles: [`
    button.ng-lock-locked {
      pointer-events: none; // disable all event on element
      border: 1px solid #999999;
      background-color: #cccccc;
      color: #666666;
      user-select: none;
    }
  `]
})
export class AppComponent {

  // if you want more control over the lock status of a decorated method,
  // you can get a Signal and/or an Observable of a given method,
  // the status: when true is locked; when false is unlocked.
  public sigAsyncMethod: Signal<boolean> = ngLockSignal(this.onAsync);
  public asyncMethod$: Observable<boolean> = ngLockObservable(this.onAsync);
  
  constructor(private http: HttpClient) { }

  /**
   * @ngLock() apply "ng-lock-locked" class on first call and remove it on `ngUnlock(this.onClick)`
   */
  @ngLock({ debug: isDevMode() })
  onClick(e: MouseEvent) {
    setTimeout(() => {
      ngUnlock(this.onClick);
      console.log('onClick', 'done');
    }, WAIT_TIME);
  }

  /**
   * @ngLock() apply "ng-lock-locked" class on first call and remove it on HTTP response (@see withNgLockContext)
   */
  @ngLock({ debug: isDevMode() })
  onHttpRequest(e: MouseEvent) {
    this.http
      .get('https://my-json-server.typicode.com/typicode/demo/db', {
        context: withNgLockContext(this.onHttpRequest),
      })
      .subscribe((response) => console.log('onHttpRequest', response));
  }

  /**
   * @ngLock() apply "ng-lock-locked" class on first call and remove it on observable changes (@see ngLockChanges)
   */
  @ngLock({ debug: isDevMode() })
  onObservable(e: MouseEvent) {
    of('done')
      .pipe(delay(WAIT_TIME), ngLockChanges(this.onObservable))
      .subscribe((response) => console.log('onObservable', response));
  }

  /**
   * @ngLock() apply "ng-lock-locked" class on first call and remove it on promise resolve
   */
  @ngLock({ debug: isDevMode() })
  async onAsync(e: MouseEvent) {
    // async method or that return a Promise is handled, automatic unlock when resolve
    await sleep(WAIT_TIME);
    console.log('onAsync', 'done');
  }

  /**
   * @ngLock() apply "ng-lock-locked" class on first call and remove on subscription changes
   */
  @ngLock({ debug: isDevMode() })
  onSubscription(e: MouseEvent) {
    // method that return a Subscription is handled, automatic unlock when changes
    return of('done')
      .pipe(delay(WAIT_TIME))
      .subscribe((response) => console.log('onSubscription', response));
  }

  /**
   * @ngLock() apply "ng-lock-locked" class on first call and remove it after unlockTimeout milliseconds
   */
  @ngLock({ debug: isDevMode(), unlockTimeout: WAIT_TIME })
  onTimeout(e: MouseEvent) {
    console.log('onTimeout', 'done');
  }
}
```

## NgLock options

There are some optional options can be injected into the `@ngLock()` decorator. This is an example with the default configuration:

```ts
import { Component } from '@angular/core';
import { ngLock, ngUnlock } from 'ng-lock';

@Component({
  selector: 'app-root',
  template: `<button (click)="onClick($event)">Click me!</button>`,
  styles: [`
    button.ng-lock-locked {
      pointer-events: none; // disable all event on element
      border: 1px solid #999999;
      background-color: #cccccc;
      color: #666666;
    }
  `]
})
export class AppComponent {

  /**
   * @ngLock() apply lock on method and "ng-lock-locked" class on first call and remove it on "ngUnlock(this.onClick)"
   */
  @ngLock({
    maxCall: 1,
    unlockTimeout: null,
    lockElementFunction: ngLockElementByTargetEventArgument(),
    lockClass: 'ng-lock-locked',
    returnLastResultWhenLocked: false,
    unlockOnPromiseResolve: true,
    unlockOnObservableChanges: true,
    debug: false
  })
  onClick(event: MouseEvent){
    // ...simulate async long task
    setTimeout(() => {
      console.log("task executed");
      // unlock the method and remove "ng-lock-locked" class on the button
      ngUnlock(this.onClick);
    }, 3000);
  }

}
```

The options are:

| Option                       | Description                                                                                    | Default                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| *maxCall*                    | Max number of the calls beyond which the method is locked                                      | `1`                                    |
| *unlockTimeout*              | Max time (in millisecond) to lock function                                                     | `null` _(no timeout)_                  |
| *lockClass*                  | CSS class applied when the method is locked                                                    | `'ng-lock-locked'`                     |
| *lockElementFunction*        | function for find the HTML element for apply the *lockClass*                                   | `ngLockElementByTargetEventArgument()` |
| *returnLastResultWhenLocked* | if `true`, when the method is locked the last result is returned, otherwise return `undefined` | `false`                                |
| *unlockOnPromiseResolve*     | if `true`, when a locked method return a Promise, the method is automatically unlock when the Promise is resolved| `true`                                |
| *unlockOnObservableChanges*  | if `true`, when a locked method return a subscription, the method is automatically unlock when the observable changes| `true` 
| *debug*                      | if `true`, the decorator log into the console some info                                        | `false`                                |

### Available lockElementFunction

The *lockElementFunction* is function used for find into the HTML the element for apply the *lockClass* (default class is `'ng-lock-locked'`).

#### ngLockElementByQuerySelector(selector: string)

Uses the provided `selector` to find with `document.querySelector()` and apply the *lockClass* on the founded element. The `selector` is a `DOMString` containing a selector to match. Eg.:

```ts
import { Component } from '@angular/core';
import { ngLock, ngUnlock } from 'ng-lock';

@Component({
  selector: 'app-root',
  template: `<button (click)="onClick()" class="my-class">Click me!</button>`,
  styles: [`
    button.ng-lock-locked {
      pointer-events: none; // disable all event on element
      border: 1px solid #999999;
      background-color: #cccccc;
      color: #666666;
    }
  `]
})
export class AppComponent {

  /**
   * @ngLock() apply lock on method and "ng-lock-locked" class on the html element with the class "my-class"
   */
  @ngLock({
    lockElementFunction: ngLockElementByQuerySelector('.my-class')
  })
  onClick(){
    // ...simulate async long task
    setTimeout(() => {
      console.log("task executed");
      // unlock the method and remove "ng-lock-locked" class on the button
      ngUnlock(this.onClick);
    }, 3000);
  }

}
```

#### ngLockElementByTargetEventArgument(argsIndex?: number)

Uses a function argument for apply the *lockClass*. If provided a `argsIndex` use the specific argument (index of the argument), otherwise search an argument with a target property (o currentTarget) that is a `HTMLElement`. Eg.:

```ts
import { Component } from '@angular/core';
import { ngLock, ngUnlock } from 'ng-lock';

@Component({
  selector: 'app-root',
  template: `<button (click)="onClick(1, $event)">Click me!</button>`,
  styles: [`
    button.ng-lock-locked {
      pointer-events: none; // disable all event on element
      border: 1px solid #999999;
      background-color: #cccccc;
      color: #666666;
    }
  `]
})
export class AppComponent {

  /**
   * @ngLock() apply lock on method and "ng-lock-locked" class on the html element provided into the target element of the second argument (index 1) of onClick() method
   */
  @ngLock({
    lockElementFunction: ngLockElementByTargetEventArgument(1)
  })
  onClick(value: number, event: MouseEvent){
    // ...simulate async long task
    setTimeout(() => {
      console.log("task executed", value);
      // unlock the method and remove "ng-lock-locked" class on the button
      ngUnlock(this.onClick);
    }, 3000);
  }

}
```

#### ngLockElementByComponentProperty(property: string)

Apply *lockClass* to a component property that must be a `HTMLElement` or element with Angular `nativeElement` (also a `HTMLElement`). Eg.:

```ts
import { Component, ViewChild } from '@angular/core';
import { ngLock, ngUnlock } from 'ng-lock';

@Component({
  selector: 'app-root',
  template: `<button (click)="onClick()" #button>Click me!</button>`,
  styles: [`
    button.ng-lock-locked {
      pointer-events: none; // disable all event on element
      border: 1px solid #999999;
      background-color: #cccccc;
      color: #666666;
    }
  `]
})
export class AppComponent {

  @ViewChild("button") button: ElementRef<HTMLElement>;

  /**
   * @ngLock() apply lock on method and "ng-lock-locked" class on the html element provided into the "button" property of the component
   */
  @ngLock({
    lockElementFunction: ngLockElementByComponentProperty('button')
  })
  onClick(){
    // ...simulate async long task
    setTimeout(() => {
      console.log("task executed");
      // unlock the method and remove "ng-lock-locked" class on the button
      ngUnlock(this.onClick);
    }, 3000);
  }

}
```

#### Write a custom lockElementFunction

You can write a custom *lockElementFunction*. Eg.:

```ts
import { Component } from '@angular/core';
import { ngLock, ngUnlock, NgLockElementFunction, NgLockElementFinder } from 'ng-lock';

const myLockElementFunction: NgLockElementFunction = (): NgLockElementFinder => {
  /**
   * @param self Is a component instance (in this example AppComponent).
   * @param args Is a @ngLock() decorated function arguments (in this example onClick()).
   */
  return (self: any, args: any[]): Element => {
    // Write your logic here ...
  };
};

@Component({
  selector: 'app-root',
  template: `<button (click)="onClick()" #button>Click me!</button>`,
  styles: [`
    button.ng-lock-locked {
      pointer-events: none; // disable all event on element
      border: 1px solid #999999;
      background-color: #cccccc;
      color: #666666;
    }
  `]
})
export class AppComponent {

  @ngLock({
    lockElementFunction: myLockElementFunction()
  })
  onClick(){
    // ...simulate async long task
    setTimeout(() => {
      console.log("task executed");
      // unlock the method and remove "ng-lock-locked" class on the button
      ngUnlock(this.onClick);
    }, 3000);
  }

}
```

## Utils function

Utils function exported by `ng-lock` library
### ngLock(options?: NgLockOption): MethodDecorator

Lock the provided function. Usage as decorator eg.:

```ts
@ngLock()
onClick(event: MouseEvent){
  // ...
}
```

### ngUnlock(methodToUnlock: NgLockFunction): void

Unlock a locked function by `ngLock()` decorator. Usage, eg.:

```ts
@ngLock()
onClick(event: MouseEvent){
  // ...
  ngUnlock(this.onClick);
}
```
### ngIsLock(methodToCheck: NgLockFunction): boolean

Return `true` if the provided function is locked by `ngLock()` decorator. Usage, eg.:

```ts
@ngLock()
onClick(event: MouseEvent){
  // ...
  console.log('onClick is locked?', ngIsLock(this.onClick) );
}
```

### ngUnlockAll(component: any): void

Unlock all locked functions by `ngLock()` decorator. Argument `component` is the component instance (`this`). Usage, eg.:

```ts
@ngLock()
onClick(event: MouseEvent){
  // ...
  ngUnlockAll(this);
}
```

### ngLockSignal(method: NgLockFunction): Signal<boolean>

Return a Signal for the given function on the lock status (locked/unlocked), eg.:

```ts
public myMethodSignal: Signal<boolean> = ngLockSignal(this.myMethod);
```

### ngLockObservable(method: NgLockFunction): Observable<boolean>

Return an Observable for the given function on the lock status (locked/unlocked), eg.:

```ts
public myMethod$: Observable<boolean> = ngLockObservable(this.myMethod);
```

### ngLockChanges(methodToUnlock: NgLockFunction): (source$: Observable<T>) => Observable<T>

RxJS Operator that unlock the method when Observable changes, eg.:

```ts
@ngLock()
onClick(event: MouseEvent) {
  of(true).pipe(ngLockChanges(this.onClick)).subscription();
}
```

### withNgLockContext(methodToUnlock: NgLockFunction, context: HttpContext = new HttpContext()): HttpContext

Return a HttpContext that unlock the method when HTTP respond, eg.:

```ts
@ngLock()
onClick(event: MouseEvent) {
  this.http.get('https://my-json-server.typicode.com/typicode/demo/db', {
    context: withNgLockContext(this.onClick),
  }).subscribe();
}
```

### ngLock directive

The `ngLock` directive it's a Angular directive lock html element when a decorated method with `@ngLock` is running a task, eg.:

```html
<input [ngLock]="myMethod" /><button (click)="myMethod($event)">Send</button>
```
```ts
@ngLock()
myMethod(event: MouseEvent){
  return new Promise(resolve => setTimeout(resolve, 5000));
}
```

## Examples

Below there are some examples of use case.

### Example: unlockTimeout

Example of use with `unlockTimeout` option, eg.:

```ts
import { Component } from '@angular/core';
import { ngLock, ngIsLock } from 'ng-lock';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="onClick($event)">Click me!</button>
    <button (click)="onCheck()">Check</button>
  `,
  styles: [`
    button.ng-lock-locked {
      pointer-events: none; // disable all event on element
      border: 1px solid #999999;
      background-color: #cccccc;
      color: #666666;
    }
  `]
})
export class AppComponent {

  /**
   * @ngLock() apply lock on method and "ng-lock-locked" class on first call and remove it after 3 seconds
   */
  @ngLock({
    unlockTimeout: 3000
  })
  onClick(event: MouseEvent){
    console.log("task executed");
  }

  onCheck(){
    console.log('onClick lock state:', ngIsLock(this.onClick));
  }
}
```
### Example: maxCall

Example of use with `maxCall` option, eg.:

```ts
import { Component } from '@angular/core';
import { ngLock, ngIsLock, ngUnlock } from 'ng-lock';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="onClick($event)">Click me!</button>
    <button (click)="onCheck()">Check</button>
    <button (click)="onUnlock()">Unlock</button>
  `,
  styles: [`
    button.ng-lock-locked {
      pointer-events: none; // disable all event on element
      border: 1px solid #999999;
      background-color: #cccccc;
      color: #666666;
    }
  `]
})
export class AppComponent {

  /**
   * @ngLock() apply lock on method and "ng-lock-locked" class after 3 call
   */
  @ngLock({
    maxCall: 3
  })
  onClick(event: MouseEvent){
    console.log("task executed");
  }

  onCheck(){
    console.log('onClick lock state:', ngIsLock(this.onClick));
  }

  onUnlock(){
    ngUnlock(this.onClick);
  }
}
```

## Support

This is an open-source project. Star this [repository](https://github.com/nigrosimone/ng-lock), if you like it, or even [donate](https://www.paypal.com/paypalme/snwp). Thank you so much!

## My other libraries

I have published some other Angular libraries, take a look:

 - [NgSimpleState: Simple state management in Angular with only Services and RxJS](https://www.npmjs.com/package/ng-simple-state)
 - [NgHttpCaching: Cache for HTTP requests in Angular application](https://www.npmjs.com/package/ng-http-caching)
 - [NgGenericPipe: Generic pipe for Angular application for use a component method into component template.](https://www.npmjs.com/package/ng-generic-pipe)
 - [NgLet: Structural directive for sharing data as local variable into html component template](https://www.npmjs.com/package/ng-let)
 - [NgForTrackByProperty: Angular global trackBy property directive with strict type checking](https://www.npmjs.com/package/ng-for-track-by-property)
