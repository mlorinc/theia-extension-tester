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