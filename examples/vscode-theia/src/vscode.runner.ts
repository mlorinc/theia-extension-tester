import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { ExTester } from 'vscode-extension-tester';
import { ReleaseQuality } from 'vscode-extension-tester/out/util/codeUtil';

const outFolder = './out';
const storageFolder = path.resolve(outFolder, 'vscode');
const releaseType: ReleaseQuality = ReleaseQuality.Stable;
const extensionFolder = path.resolve(outFolder, '.test-extensions');

// latest version
const vscodeVersion = undefined;

async function main(): Promise<void> {
    console.log(process.argv.join('\n'));
    if (process.argv[2] === 'install') {
        await install();
        return;
    }
    await test();
}

main();

function getTester(): ExTester {
    return new ExTester(storageFolder, releaseType, extensionFolder);
}

async function install() {
    // make sure extension folder is empty
    fsExtra.removeSync(extensionFolder);
    fsExtra.mkdirsSync(extensionFolder);

    const tester = getTester();
    await tester.downloadCode(vscodeVersion);
    await tester.downloadChromeDriver(vscodeVersion);
    try {
        await tester.installFromMarketplace('redhat.vscode-quarkus');
    }
    catch (e) {
        console.error('Could not install quarkus.');
        throw e;
    }
    return tester;
}

async function test() {
    await getTester().runTests('out/tests/vscode-entry.js', {
        vscodeVersion,
    });
}