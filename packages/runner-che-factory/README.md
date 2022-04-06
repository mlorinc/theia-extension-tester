# `che-factory-runner`

Module extending [@theia-extension-tester/mocha-runner](https://www.npmjs.com/package/@theia-extension-tester/mocha-runner) functionality.
Its only purpose is to create new Eclipse Che workbench and run tests in the workbench. In order to create workbench the user must provide devfile.yml.

## Usage

Install via npm

`npm install @theia-extension-tester/che-factory-runner`

Install via yarn

`yarn add @theia-extension-tester/che-factory-runner`

Create new CheTheiaFactoryRunner object. For browser creation please
refer to [@theia-extension-tester/che-browser](https://www.npmjs.com/package/@theia-extension-tester/che-browser) and for authenticator see [@theia-extension-tester/openshift-authenticator](https://www.npmjs.com/package/@theia-extension-tester/openshift-authenticator).

Some Devfile urls can be found in [Devfile registry](https://codeready-codeready-workspaces-operator.apps.sandbox.x8i5.p1.openshiftapps.com/devfile-registry/devfiles/).

```ts
const runner = new CheTheiaFactoryRunner(browser, {
    // Base Eclipse Che url.
    cheUrl: cheUrl,
    // Url to devfile.yml. Must be on accessible public
    // place (e.g. GitHub repository).
    factoryUrl: devfileUrl,
    // Mocha options
    mochaOptions: {
        ...mochaOptions
    }
    // Factory attributes to be appended to Url.
    // This attribute is used when it is desirable
    // to override some field in Devfile.
    factoryAttributes: {
        ...factoryAttributes
    }
}, authenticator);
```

Then it is possible to run tests in provided browser.

```ts
await runner.runTests([
    "out/tests/Input.test.js",
    "out/tests/TextEditor.test.js"
]);
```
