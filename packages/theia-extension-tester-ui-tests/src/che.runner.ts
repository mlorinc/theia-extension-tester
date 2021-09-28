import { OpenShiftAuthenticator, OpenShiftAuthenticatorMethod } from "@theia-extension-tester/openshift-authenticator";
import { CheTheiaFactoryRunner } from "@theia-extension-tester/che-factory-runner";
import { CheTheiaBrowser } from "@theia-extension-tester/che-browser";
import { Authenticator } from "@theia-extension-tester/base-authenticator";

async function main() {
	if (process.env.CHE_USERNAME === undefined) {
		console.error('CHE_USERNAME variable is missing in .env file.');
		process.exit(1);
	}

	if (process.env.CHE_PASSWORD === undefined) {
		console.error('CHE_PASSWORD variable is missing in .env file.');
		process.exit(1);
	}

	const authenticator = new OpenShiftAuthenticator({
		inputData: [
			{
				name: 'username',
				value: process.env.CHE_USERNAME
			},
			{
				name: 'password',
				value: process.env.CHE_PASSWORD
			}
		],
		multiStepForm: true,
		loginMethod: OpenShiftAuthenticatorMethod.DEVSANDBOX
	});

	////https://workspaces.openshift.com/f?url=https://codeready-codeready-workspaces-operator.apps.sandbox.x8i5.p1.openshiftapps.com/devfile-registry/devfiles/03_java11-maven-quarkus/devfile.yaml&override.attributes.persistVolumes=false
	const runner = cheRunner(authenticator);

	// Remove first element - program path
	const [, ...args] = process.argv;
	process.exit(await runner.runTests(args));
}

main();

// @ts-ignore
function cheRunner(auth: Authenticator): CheTheiaFactoryRunner {
	////https://workspaces.openshift.com/f?url=https://codeready-codeready-workspaces-operator.apps.sandbox.x8i5.p1.openshiftapps.com/devfile-registry/devfiles/03_java11-maven-quarkus/devfile.yaml&override.attributes.persistVolumes=false
	const runner = new CheTheiaFactoryRunner(new CheTheiaBrowser('chrome', {
		timeouts: {
			implicit: 15000,
			pageLoad: 250000
		}
	}), {
		cheUrl: 'https://workspaces.openshift.com/',
		factoryUrl: 'https://codeready-codeready-workspaces-operator.apps.sandbox.x8i5.p1.openshiftapps.com/devfile-registry/devfiles/03_java11-maven-quarkus/devfile.yaml',
		mochaOptions: {
			bail: true
		}
	}, auth);
	return runner;
}
