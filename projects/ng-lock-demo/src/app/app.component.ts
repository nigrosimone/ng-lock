/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Component, Signal, ViewChild } from '@angular/core';
import { ngLock, ngLockElementByComponentProperty, ngLockElementByQuerySelector, ngUnlock, withNgLockContext, ngLockChanges, ngLockSignal, ngLockObservable, ngUnlockAll } from 'projects/ng-lock/src/public-api';
import { delay, Observable } from 'rxjs';

const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild("button3") button3 = null;

  public sigPromiseMethod: Signal<boolean> = ngLockSignal(this.promiseMethod);
  public promiseMethod$: Observable<boolean> = ngLockObservable(this.promiseMethod);
  
  constructor(private http: HttpClient) { }

  @ngLock({ debug: true })
  async test1(_: MouseEvent) {
    try {
      await sleep(1000);
      console.log("test1");
    } finally {
      ngUnlock(this.test1);
    }
  }

  @ngLock({ unlockTimeout: 3000, debug: true })
  test2(_: MouseEvent) {
    setTimeout(() => {
      console.log("test2");
    }, 1000);
  }

  @ngLock({
    unlockTimeout: 3000,
    lockElementFunction: ngLockElementByComponentProperty("button3"),
    debug: true
  })
  test3() {
    setTimeout(() => {
      console.log("test3");
    }, 1000);
  }

  @ngLock({
    unlockTimeout: 3000,
    lockElementFunction: ngLockElementByQuerySelector("#button4"),
    debug: true
  })
  test4() {
    setTimeout(() => {
      console.log("test4");
    }, 1000);
  }

  @ngLock({
    unlockTimeout: 3000,
    maxCall: 3,
    lockElementFunction: ngLockElementByQuerySelector(".button5"),
    debug: true
  })
  test5() {
    setTimeout(() => {
      console.log("test5");
    }, 1000);
  }

  @ngLock({
    lockElementFunction: null as any,
    debug: true
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
    lockElementFunction: ngLockElementByQuerySelector(".button8"),
    debug: true
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
    returnLastResultWhenLocked: true,
    debug: true
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

  @ngLock({ debug: true })
  httpContext(_: MouseEvent) {
    this.http.get('https://my-json-server.typicode.com/typicode/demo/db', {
      context: withNgLockContext(this.httpContext)
    })
      .pipe(delay(1000))
      .subscribe(response => console.log(this.httpContext.name, response))
  }

  @ngLock({ debug: true })
  observableChanges(_: MouseEvent) {
    this.http.get('https://my-json-server.typicode.com/typicode/demo/db')
      .pipe(delay(1000), ngLockChanges(this.observableChanges))
      .subscribe(response => console.log(this.observableChanges.name, response))
  }

  @ngLock({ debug: true })
  async asyncMethod(_: MouseEvent) {
    await sleep(1000);
    console.log(this.asyncMethod.name, 'done')
  }

  @ngLock({ debug: true })
  promiseMethod(_: MouseEvent) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(this.promiseMethod.name, 'done')
        resolve(true);
      }, 1000)
    });
  }

  @ngLock({ debug: true })
  subscriptionCompleted(_: MouseEvent) {
    return this.http.get('https://my-json-server.typicode.com/typicode/demo/db')
      .pipe(delay(1000))
      .subscribe(response => console.log(this.subscriptionCompleted.name, response))
  }
  
  @ngLock({ debug: true })
  onNoUnlock(_: MouseEvent){

  }

  onNgUnlockAll(){
    ngUnlockAll(this)
  }
}
