# `mocha-runner`

Module for launching [mocha](https://www.npmjs.com/package/mocha) tests.

## Usage

Install via npm

`npm install @theia-extension-tester/mocha-runner`

Install via yarn

`yarn add @theia-extension-tester/mocha-runner`

Create new MochaRunner object. For browser creation please
refer to [@theia-extension-tester/base-browser](https://www.npmjs.com/package/@theia-extension-tester/base-browser).

```ts
const runner = new MochaRunner(browser, mochaOptions, authenticator);
```

Then it is possible to run tests in provided browser.

```ts
await runner.runTests([
    "out/tests/Input.test.js",
    "out/tests/TextEditor.test.js"
]);
```
