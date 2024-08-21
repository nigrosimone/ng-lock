/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { ngLockChanges } from 'ng-lock';
import { ngLock, ngLockElementByComponentProperty, ngLockElementByQuerySelector, ngUnlock, withNgLockContext } from 'projects/ng-lock/src/public-api';
import { delay } from 'rxjs';

const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild("button3") button3 = null;

  constructor(private http: HttpClient) { }

  @ngLock()
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  async test1(e: MouseEvent) {
    try {
      await sleep(1000);
      console.log("test1");
    } finally {
      ngUnlock(this.test1);
    }
  }

  @ngLock({ unlockTimeout: 3000 })
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  test2(e: any) {
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
    lockElementFunction: null as any
  })
  test6(): void {
    (this.test6 as any).ngUnlockCallback();
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
    lockElementFunction: null as any,
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

  @ngLock()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  httpContext(e: MouseEvent) {
    this.http.get('https://my-json-server.typicode.com/typicode/demo/db', {
      context: withNgLockContext(this.httpContext)
    })
      .pipe(delay(1000))
      .subscribe(response => console.log(this.httpContext.name, response))
  }

  @ngLock()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  observableChanges(e: MouseEvent) {
    this.http.get('https://my-json-server.typicode.com/typicode/demo/db')
      .pipe(delay(1000), ngLockChanges(this.observableChanges))
      .subscribe(response => console.log(this.observableChanges.name, response))
  }

  @ngLock()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async asyncMethod(e: MouseEvent) {
    await sleep(1000);
    console.log(this.asyncMethod.name, 'done')
  }

  @ngLock()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  promiseMethod(e: MouseEvent) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(this.promiseMethod.name, 'done')
        resolve(true);
      }, 1000)
    });
  }

  @ngLock()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscriptionCompleted(e: MouseEvent) {
    return this.http.get('https://my-json-server.typicode.com/typicode/demo/db')
      .pipe(delay(1000))
      .subscribe(response => console.log(this.subscriptionCompleted.name, response))
  }
}
