import { Component, ViewChild } from '@angular/core';
import { ngLock, NgLockDecoratedFunction, ngLockElementByComponentProperty, ngLockElementByQuerySelector, ngUnlock } from 'projects/ng-lock/src/public-api';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild("button3") button3 = null;

  @ngLock()
  test1(e: MouseEvent) {
    setTimeout(() => {
      console.log("test1");
      ngUnlock(this.test1);
    }, 1000);
  }

  @ngLock({ unlockTimeout: 3000 })
  test2(e) {
    setTimeout(() => {
      console.log("test2");
    }, 1000);
  }

  @ngLock({ 
    unlockTimeout: 3000, 
    lockElementFunction: ngLockElementByComponentProperty("button3"),
  })
  test3() {
    setTimeout(() => {
      console.log("test3");
    }, 1000);
  }

  @ngLock({ 
    unlockTimeout: 3000, 
    lockElementFunction: ngLockElementByQuerySelector("#button4"), 
  })
  test4() {
    setTimeout(() => {
      console.log("test4");
    }, 1000);
  }

  @ngLock({ 
    unlockTimeout: 3000, 
    lockElementFunction: ngLockElementByQuerySelector(".button5")
  })
  test5() {
    setTimeout(() => {
      console.log("test5");
    }, 1000);
  }

  @ngLock({
    lockElementFunction: null
  })
  test6() {
    (this.test6 as NgLockDecoratedFunction).ngUnlockCallback();
    console.log("test6");
  }

  test7() {
    setTimeout(() => {
      console.log("test7");
      ngUnlock(this.test7);
    }, 1000);
  }

  @ngLock({
    lockElementFunction: ngLockElementByQuerySelector(".button8")
  })
  async test8(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("test8");
        ngUnlock(this.test8);
        resolve(true);
      }, 1000);
    });
  }

  @ngLock({
    maxCall: 3,
    lockElementFunction: null,
    returnLastResultWhenLocked: true
  })
  test9(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("test9");
        ngUnlock(this.test9);
        resolve(true);
      }, 3000);
    });
  }
}
