# NgLock [![Build Status](https://travis-ci.com/nigrosimone/ng-lock.svg?branch=main)](https://travis-ci.com/nigrosimone/ng-lock) [![Coverage Status](https://coveralls.io/repos/github/nigrosimone/ng-lock/badge.svg?branch=main)](https://coveralls.io/github/nigrosimone/ng-lock?branch=main) [![NPM version](https://img.shields.io/npm/v/ng-lock.svg)](https://www.npmjs.com/package/ng-lock)

Angular decorator for lock a function and user interface while a task running.

## Description

Sometime there is a need to lock a function and the user interface while a task is running.
This library expose a practical decorator that do it, in a simple way.

See the [stackblitz demo](https://stackblitz.com/edit/demo-ng-lock?file=src%2Fapp%2Fapp.component.ts).

## Get Started

*Step 1*: install `ng-lock`

```bash
npm i ng-lock
```

*Step 2*: Decorate a function with `@ngLock()` decorator, eg.:

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
   * @ngLock() apply "ng-lock-locked" class on first call and remove it on "ngUnlock(this.onClick)"
   */
  @ngLock()
  onClick(event: MouseEvent){
    // ...simulate async long task
    setTimeout(() => {
      // task ended
      console.log("task ended");
      // unlock the method and remove "ng-lock-locked" class on the button
      ngUnlock(this.onClick);
    }, 3000);
  }

}
```

## NgLock options

There are some optional options can be injectet into the `@ngLock()` decorator. This is an example with the default configuration:

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
| *debug*                      | if `true`, the decorator log into the console some info                                        | `false`                                |

### Available lockElementFunction

The *lockElementFunction* is function used for find into the HTML the element for apply the *lockClass* (default class is `'ng-lock-locked'`).

#### ngLockElementByQuerySelector(selector: string)

Uses the provided "selector" to find with "querySelector()" and apply the lockClass on the founded element. The `selector` is a DOMString containing a selector to match. Eg.:

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

Uses a function argument for apply the lockClass. If provided a `argsIndex` use the specific argument (index of the argument), otherwise search an argument with a target property (o currentTarget) that is a HTMLElement. Eg.:

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

Apply lockClass to a component property that must be a HTMLElement or element with Angular nativeElement (also a HTMLElement). Eg.:

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

## Examples

Below there are some examples of use case.

### Example: unlockTimeout

Example of use with `unlockTimeout` option, eg.:

```ts
import { Component } from '@angular/core';
import { ngLock, ngUnlock } from 'ng-lock';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="onClick($event)">Click me!</button>
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
   * @ngLock() apply lock on method and "ng-lock-locked" class on first call and remove it after 3 seconds
   */
  @ngLock({
    unlockTimeout: 3000
  })
  onClick(event: MouseEvent){
    console.log("task executed");
  }

  onUnlock(){
    ngUnlock(this.onClick);
  }
}
```
### Example: maxCall

Example of use with `maxCall` option, eg.:

```ts
import { Component } from '@angular/core';
import { ngLock } from 'ng-lock';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="onClick($event)">Click me!</button>
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

  onUnlock(){
    ngUnlock(this.onClick);
  }
}
```

## Support

This is an open-source project. Star this [repository](https://github.com/nigrosimone/ng-lock), if you like it, or even [donate](https://www.paypal.com/paypalme/snwp). Thank you so much!
