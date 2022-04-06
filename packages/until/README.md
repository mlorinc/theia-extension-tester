# `until`

This package provides collection of some waiting conditions
and other wait conditions used in [@theia-extension-tester/page-objects](https://www.npmjs.com/package/@theia-extension-tester/page-objects).

## Usage

install:un

intercepted

```ts
await driver.wait(elementInteractive(element), 5000);
```

Perform a safe click on element. Element must be interactive before
click is made. Click interception is handled.

```ts
await driver.wait(safeClick(element), 5000);
```

Perform a safe sendKeys on element. Element must be interactive before
keystroke is made. Keystroke interception is handled.

```ts
await driver.wait(safeSendKeys(element, "Hello, world!"), 5000);
```