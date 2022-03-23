import { TheiaExTester } from "theia-extension-tester";
import * as path from "path";

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'out', 'projects');
const resources = path.join(root, 'src', 'tests', 'resources');
const project = path.join(resources, 'quarkus-quickstarts');

// set expected path in tests
process.env['THEIA_EXPECTED_WORKBENCH_PATH'] = dir;

const tester = new TheiaExTester({
    tests: process.argv.slice(2),
    mocha: {
        bail: true
    },
    timeouts: {
        implicit: 30000,
        pageLoad: 50000
    },
    folder: dir,
    "copy-files": [project],
});

tester.runTests().then((code) => process.exitCode = code);