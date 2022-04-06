# `adapters`

An adapter package to make [theia-extension-tester](https://www.npmjs.com/package/theia-extension-tester) and
[vscode-extension-tester](https://www.npmjs.com/package/vscode-extension-tester) compatible without
modifications to source code. Either `theia()` or `vscode()` call must be applied as soon as possible.

## Usage

Install via npm

`npm install @theia-extension-tester/adapters`

Install via yarn

`yarn add @theia-extension-tester/adapters`

```js
// Replace vscode-extension-tester import with theia-extension-tester.
const theia = require('@theia-extension-tester/adapters/theia');
// or
// Replace theia-extension-tester import with vscode-extension-tester.
const vscode = require('@theia-extension-tester/adapters/vscode');

theia()
// or
vscode()
```
