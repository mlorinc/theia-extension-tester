import * as path from 'path';
import { Authenticator } from '@theia-extension-tester/base-authenticator';
import { BaseBrowser } from '@theia-extension-tester/base-browser';
import { MochaRunner } from '@theia-extension-tester/mocha-runner';
import { PathUtils } from '@theia-extension-tester/path-utils';
import { URL } from 'url';
import Mocha = require('mocha');

export interface TheiaBrowserRunnerOptions {
    mochaOptions?: Mocha.MochaOptions,
    openFolder?: string;
    query?: { [key: string]: string };
    theiaUrl: string;
}

export class TheiaBrowserRunner extends MochaRunner {
    constructor(browser: BaseBrowser, protected options: TheiaBrowserRunnerOptions, private authenticator?: Authenticator) {
        super(browser, options.mochaOptions);
    }

    protected async beforeAll(ctx: Mocha.Context): Promise<void> {
        await super.beforeAll(ctx);

        let folderPath = this.options.openFolder;
        let urlSuffix = '/';


        if (folderPath) {
            folderPath = PathUtils.normalizePath(folderPath);
            if (path.isAbsolute(folderPath) === false) {
                folderPath = path.resolve('.', folderPath);
            }

            urlSuffix = `/#${folderPath}`;
        }

        const root = new URL(urlSuffix, this.options.theiaUrl);

        if (this.options.query) {
            for (const key of Object.keys(this.options.query)) {
                root.searchParams.append(key, this.options.query[key]);
            }
        }

        await this.browser.driver.get(root.toString());
        await this.authenticator?.authenticate();
        await this.browser.waitForWorkbench();
    }
}
