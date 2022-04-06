As part of this getting started guide we are going to create simple UI test which opens command prompt via menu bar. The tests are launched on Eclipse Theia web instance as for now Electron is not supported by the tester. Eclipse Theia instance must be created by user. Before we get started make sure you have [Selenium WebDriver installed](https://github.com/mlorinc/theia-extension-tester/tree/docs#selenium-webdriver).

## Prepare workspace

First we need to create new workspace where we will write our tests. Let's say we have created new directory *hello-world-theia-web* using `mkdir hello-world-theia-web`. This will be our project directory. Next in order to install npm packages the project initialization must be made.

To initialize npm project ignoring prompts run (for this guide prompts are not necessary):
```sh
npm init -y
```

After the initialization it is now possible to install Theia Extension Tester with command:

```sh
npm install theia-extension-tester --save-dev
```

For simplicity it is possible to create tests directly in project directory. However in practice those tests are usually located `src/tests/ui` or any other source directory.

To create folder run the following commands:

```sh
# Create source folder for ui tests
mkdir -p src/tests/ui
# Create a new test file
touch src/tests/ui/HelloWorld.test.js
```

## Writing first test

Open the created file from previous section. Paste the following content into the file:

```js
// src/tests/ui/HelloWorld.test.js
const assert = require('assert');
// In case tests were not written in vscode-extension-tester (this example case)
const { Input, TitleBar } = require('theia-extension-tester');
/* 
Or if launching vscode-extension-tester tests (theia-extension-tester package replaces vscode-extension-tester imports with theia-extension-tester imports)
*/
// const { Input, TitleBar } = require('vscode-extension-tester');

describe('Input', function() {
    // set timeout for every it to 40 seconds
    this.timeout(40000);
    it('Input.create', async function() {
        // open command palette
        await new TitleBar().select('View', 'Find Command...');
        // create Input page object
        const input = await Input.create();
        // verify the input is visible
        assert.ok(await input.isDisplayed());
        // close the input
        await input.cancel();
    });
});
```

The pasted in program will open command palette via menu bar, verify its visibility and then closes it. In this particular program we use [Mocha](https://mochajs.org/) to run test files. But this is not enough because Mocha does launch ui tests but tests will not work without Selenium WebDriver. We need to define launcher which will create Selenium WebDriver for us.

## Launching first test

As mentioned before the tests are going to be launched on Eclipse Theia instance. Eclipse Theia instances are easier to create than Eclipse Che instances therefore it possible to run straightaway any of the following steps:

> Execute command `node_modules/.bin/theiatest theia:run --env .env --browser chrome src/tests/ui/*.test.js`

OR

> Open `package.json` file and add `"test:ui": "theiatest theia:run --env .env --browser chrome src/tests/ui/*.test.js"` to `"scripts"` object. Then run `npm run test:ui`.


Chrome should open up and launch tests including logging in user into Eclipse Che. Alternatively you can use one of the supported browsers. If you do not host Eclipse Theia on default IP and port the `--url` flag must be specified with your instance url.
