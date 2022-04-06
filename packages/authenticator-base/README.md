# `base-authenticator`

An authenticator interface for authenticator objects. Authenticator objects are responsible for logging in user into Eclipse Che. Used by [theia-extension-tester](https://www.npmjs.com/package/theia-extension-tester).

## Usage

Install via npm

`npm install @theia-extension-tester/base-authenticator`

Install via yarn

`yarn add @theia-extension-tester/base-authenticator`

```js
import { Authenticator } from "@theia-extension-tester/base-authenticator";
import { SeleniumBrowser } from "extension-tester-page-objects";

class CheAuthenticator implements Authenticator {
    async authenticate() : Promise<void> {
        const driver = SeleniumBrowser.instance.driver;
        // ... log in user using SeleniumWebDriver
    }
}
```
