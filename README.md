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

 - *maxCall*: Max number of the calls beyond which the method is locked (default: `1`)
 - *unlockTimeout*: Max time (in millisecond) to lock function (default: `null` - no timeout)
 - *lockElementFunction*: function for find the HTML element for apply the  *lockClass* (default: `ngLockElementByTargetEventArgument()`)
 - *lockClass*: CSS class applied when the method is locked (default: `'ng-lock-locked'`)
 - *returnLastResultWhenLocked*: if `true`, when the method is locked the last result is returned, otherwise return `undefined` (default: `false`)
 - *debug*: if `true`, the decorator log into the console some info (default: `false`)


### Available lockElementFunction

*ngLockElementByQuerySelector*

```ts
/**
 * Uses the provided "selector" to find with "querySelector()" and apply the lockClass on the founded element.
 * @param selector A DOMString containing a selector to match.
 */
@ngLock({
  lockElementFunction: ngLockElementByQuerySelector('.my-class')
})
onClick(){
  // ...
}
```

*ngLockElementByTargetEventArgument*

```ts
/**
 * Uses a function argument for apply the lockClass. If provided a argsIndex use the specific argument, otherwise
 * search an argument with a target property that is a HTMLElement
 * @param argsIndex (optional) index of the argument that is HTMLElement or contains target property (also a HTMLElement)
 * @returns Return a NgLockElementFinder function
 */
@ngLock({
  lockElementFunction: ngLockElementByTargetEventArgument()
})
onClick(event: MouseEvent){
  // ...
}
```

*ngLockElementByComponentProperty*

```ts
/**
 * Apply lockClass to a component property that must be a HTMLElement or element with Angular nativeElement (also a HTMLElement)
 * @param property The property name of the component
 * @returns Return a NgLockElementFinder function
 */
@ViewChild("button") button: ElementRef<HTMLElement>;

@ngLock({
  lockElementFunction: ngLockElementByComponentProperty('button')
})
onClick(){
  // ...
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
