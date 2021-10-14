import { TheiaBrowser, TheiaBrowserRunner } from "theia-extension-tester";
import { prepareWorkspace } from "./utils";

async function main() {
	const electronPath = process.env['ELECTRON_PATH'];

	const browser = new TheiaBrowser('chrome', {
		// todo: fix electron detection
		distribution: electronPath ? 'theia' : 'codeready',
		browserLocation: electronPath,
		timeouts: {
			implicit: 30000,
			pageLoad: 50000
		}
	});

	const runner = new TheiaBrowserRunner(browser, {
		theiaUrl: 'http://localhost:3000',
		openFolder: prepareWorkspace(),
		mochaOptions: {
			bail: false
		}
	});

	// Remove first element - program path
	const [, ...args] = process.argv;
	process.exit(await runner.runTests(args));
}

main();
