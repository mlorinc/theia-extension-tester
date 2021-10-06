import { VSBrowser } from 'vscode-extension-tester';
import { prepareWorkspace } from "../utils";

describe('vscode tests', async function() {
    this.timeout(30000);
    before(async function() {
        await VSBrowser.instance.openResources(prepareWorkspace());
    });
    await require('./quarkus.test');
});