# `base-browser`

Base browser implementation for [Eclipse Theia / Eclipse Che testers](https://www.npmjs.com/package/theia-extension-tester).
Browser objects are responsible for Selenium WebDriver creation, loading locators and attaching to workspace.
Currently two versions are primarily used [@theia-extension-tester/che-browser](https://www.npmjs.com/package/@theia-extension-tester/che-browser)
and [@theia-extension-tester/theia-browser](https://www.npmjs.com/package/@theia-extension-tester/theia-browser).

## Usage

Install via npm

`npm install @theia-extension-tester/base-browser`

Install via yarn

`yarn add @theia-extension-tester/base-browser`

This example demonstrates how to create base browser. However base browser is in the most cases
used as super class instead. It is recommended to use specific browser implementations instead
such as [Eclipse Che browser](https://www.npmjs.com/package/@theia-extension-tester/che-browser)
or [Eclipse Theia browser](https://www.npmjs.com/package/@theia-extension-tester/theia-browser).

```ts
import { BaseBrowser, BrowserOptions, ITimeouts } from "@theia-extension-tester/base-browser";
import { logging } from 'extension-tester-page-objects';

// It is recommended to use more specific browser mentioned above.
const browser = BaseBrowser("chrome"), {
    // Optional path to browser binary. 
    // If not specified PATH variable is used.
    browserLocation: "/path/to/browser",
    // Clean session after window is closed.
    cleanSession: true,
    // Optional path to Selenium WebDriver binary.
    // If not specified PATH variable is used.
    driverLocation: "/path/to/webdriver",
    // Selenium WebDriver log level.
    logLevel: logging.Level.INFO,
    // Timeouts used when testing.
    timeouts: {
        // Timeout after browser is attached to Eclipse Theia editor.
        implicit: 30000,
        // Timeout before browser is attached to the editor.
        pageLoad: 120000
    }
});
```

Then it is possible to start new session with:

```ts
await browser.start();
```

Optionally wait for workbench. Please note the function waits for
workbench. In Eclipse Che instances it will not work on its own.
In this case please refer to [OpenShift authenticator](https://www.npmjs.com/package/@theia-extension-tester/openshift-authenticator).

```ts
await browser.waitForWorkbench(myTimeout);
```

And to properly destroy running session use:

```ts
await browser.quit();
```