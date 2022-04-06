# `timeout-promise`

Add timeout to promise object. This package provides TimeoutPromise class extending Promise object.
TimeoutPromise has single public static method and a constructor to create new TimeoutPromise instance.
When timeout is reached, the promise is rejected with `TimeoutError`.

## Usage

Install via npm

`npm install @theia-extension-tester/timeout-promise`

Install via yarn

`yarn add @theia-extension-tester/timeout-promise`


Create new TimeoutPromise with Executor.

```ts
new TimeoutPromise((resolve) => resolve(5), 5000, {id: "Return 5", message: "Could not return 5."});
```

Crate new TimeoutPromise from existing promise.

```ts
TimeoutPromise.createFrom(returnFivePromise, 5000, {id: "Return 5", message: "Could not return 5."});
```