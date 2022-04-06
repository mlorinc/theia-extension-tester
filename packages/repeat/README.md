# `repeat`

Repeat module was heavily inspired by Selenium WebDriver.wait method.
However it was not possible to use in [@theia-extension-tester/abstract-element](https://www.npmjs.com/package/@theia-extension-tester/abstract-element) due to recursion problem when searching elements.
By the time the functionality was extended even further and the repeat function was prioritized more than driver.wait function.

## Features

The Repeat class implements the same features as driver.wait but there are some key differences:

1. Method behavior when timeout = 0 :: driver.wait uses infinity timeout instead / the Repeat class performs single iteration
2. Method behavior when timeout = undefined :: The same behavior. Loop indefinitely.
3. The Repeat class supports threshold timer. Timer which does not resolve promise immediately but checks
returned value was truthful for duration of threshold time. Useful when some page object is laggy.

Single loop in the class is one execution of given function as argument. This behavior can be overridden
by returning object in the given function. The object has the following format:

 ```ts
 {
    // Value to be checked and returned.
    value?: T;
    // Use one of these to mark loop end.
    // If given LOOP_DONE and timeout = 0 then the repeat returns the value.
    loopStatus: LoopStatus.LOOP_DONE | LoopStatus.LOOP_UNDONE
    // Delay next loop. Default is 0.
    delay?: number;
 }
```
Support for delaying next iteration. Some operations requires multiple checks but the checks cannot be repeated rapidly
in consecutive manner. This feature was for example used in TextEditor page object. Without delays Eclipse Che web sockets
were failing. To see how to use delays please refer to example above.

## Usage

Install via npm

`npm install @theia-extension-tester/repeat`

Install via yarn

`yarn add @theia-extension-tester/repeat`

Verify Input page object does not have error message when given input.
This action is sometimes flaky and therefore repeat might be good for this situation.

```ts
const input = await InputBox.create();
// Do not await on purpose of demonstration.
input.setText("hello@world.com");
// Verify email validation went through.
await repeat(async () => {
 try {
     // In case the input becomes stale.
     const in = await InputBox.create();
     return await in.hasError() === false;
     // or
     // return {
     //   value: await in.hasError() === false,
     //   loopStatus: LoopStatus.LOOP_DONE,
     //   delay: 150
     // };
 }
 catch (e) {
     return false;
 }
}, {
 timeout: 30000,
 message: "Email could not be successfully verified.",
 // Make sure the result is stable.
 threshold: 1000
})
```

## Limitations

At this moment it is not possible to share timeouts between nested repeats. So when working with repeats take in account other repeats because if one of them raises an exception, others repeats **are not aborted** by default. If any task is left running and unbound by timeout condition then it will run until program finishes and might result in program getting stuck and deadlocked.