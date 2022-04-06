# `browser-runner`

Module extending [@theia-extension-tester/mocha-runner](https://www.npmjs.com/package/@theia-extension-tester/mocha-runner) functionality.
It provides quick start to Eclipse Theia testing and adds new Eclipse Theia specific utilities which are commonly used when testing.
Currently only interaction through web interface is supported. Electron interface has not been implemented yet.

## Features

The runner as other runners is responsible for preparing workspace. [Authentication](https://www.npmjs.com/package/@theia-extension-tester/base-authenticator) is supported as well. Last significant features are open folder and custom Url query utility.

## Usage

Install via npm

`npm install @theia-extension-tester/browser-runner`

Install via yarn

`yarn add @theia-extension-tester/browser-runner`

Create new runner object.

```ts
const runner = new TheiaBrowserRunner(browser, {
    mochaOptions?: Mocha.MochaOptions,
    openFolder?: string;
    query?: { [key: string]: string };
    theiaUrl: string;
}, authenticator /* optional */);
```

Then it is possible to run tests in provided browser.

```ts
await runner.runTests([
    "out/tests/Input.test.js",
    "out/tests/TextEditor.test.js"
]);
```