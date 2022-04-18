import { CheExTester } from "theia-extension-tester";

process.env['THEIA_EXPECTED_WORKBENCH_PATH'] = '/projects'

if (process.env['CHE_DEVFILE_URL'] === undefined) {
    throw new Error('CHE_DEVFILE_URL is undefined');
}

const tester = new CheExTester({
    url: process.env['CHE_URL'],
    tests: process.argv.slice(2),
    devfile: process.env['CHE_DEVFILE_URL'],
    mocha: {
        bail: false
    },
    timeouts: {
        implicit: 15000,
        pageLoad: 240000
    },
    clean: true
});

tester.runTests().then((code) => process.exitCode = code);