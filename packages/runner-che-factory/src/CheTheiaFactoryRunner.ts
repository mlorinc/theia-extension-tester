import Mocha = require('mocha');
import { URL } from "url";
import { MochaRunner } from '@theia-extension-tester/mocha-runner';
import { Authenticator } from "@theia-extension-tester/base-authenticator";
import { BaseBrowser } from '@theia-extension-tester/base-browser';

export interface CheTheiaFactoryRunnerOptions {
    mochaOptions?: Mocha.MochaOptions,
    /**
     * URL to devfile.yml.
     */
    factoryUrl: string;
    /**
     * devfile.yml attribute override.
     */
    factoryAttributes?: { [key: string]: string };
    /**
     * URL to Eclipse Che instance.
     */
    cheUrl: string;
}

/**
 * Runner which will create Eclipse Che workspace. Workspace must be deleted manually after each run.
 */
export class CheTheiaFactoryRunner extends MochaRunner {
    constructor(browser: BaseBrowser, protected options: CheTheiaFactoryRunnerOptions, private authenticator?: Authenticator) {
        super(browser, options.mochaOptions);
    }

    protected async beforeAll(ctx: Mocha.Context): Promise<void> {
        await super.beforeAll(ctx);
        const root = new URL('/f', this.options.cheUrl);

        root.searchParams.append('url', this.options.factoryUrl);

        if (this.options.factoryAttributes) {
            for (const key of Object.keys(this.options.factoryAttributes)) {
                root.searchParams.append(key, this.options.factoryAttributes[key]);
            }
        }

        await this.browser.driver.navigate().to(root.toString());
        await this.authenticator?.authenticate();
        await this.browser.waitForWorkbench();
    }
}
