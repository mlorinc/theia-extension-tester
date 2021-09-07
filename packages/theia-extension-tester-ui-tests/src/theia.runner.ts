import { TheiaBrowser } from "@theia-extension-tester/theia-browser";
import { TheiaBrowserRunner } from "@theia-extension-tester/browser-runner";
import * as fs from "fs-extra";
import * as path from "path";

function prepareWorkspace() {
	// create test dir
	const dir = path.resolve('.', 'out', 'projects');
	const resources = path.resolve('.', 'src', 'tests', 'resources');

	// set expected path in tests
	process.env['THEIA_EXPECTED_WORKBENCH_PATH'] = dir;
	// prepare workspace
	fs.removeSync(dir);
	fs.mkdirSync(dir);

	for (const file of fs.readdirSync(resources)) {
		fs.copySync(path.join(resources, file), path.join(dir, file));
	}

	return dir;
}

async function main() {
	const electronPath = process.env['ELECTRON_PATH'];

	const browser = new TheiaBrowser('chrome', {
		// todo: fix electron detection
		distribution: electronPath ? 'theia' : 'codeready',
		browserLocation: electronPath,
		timeouts: {
			implicit: 30000,
			pageLoad: 250000
		}
	});

	const runner = new TheiaBrowserRunner(browser, {
		theiaUrl: 'http://localhost:3000',
		openFolder: prepareWorkspace(),
		mochaOptions: {
			bail: true
		}
	});

	// Remove first element - program path
	const [, ...args] = process.argv;
	process.exit(await runner.runTests(args));
}

main();
