import { getTimeout, TestRunner } from 'extension-tester-page-objects';
import Mocha = require('mocha');
import sanitize = require('sanitize-filename');
import { CheBrowser } from '../browser';

export class DashboardTestRunner implements TestRunner {
    constructor(protected browser: CheBrowser, protected mochaOptions?: Mocha.MochaOptions) {

    }

    protected async setup(): Promise<void> { }

    async runTests(files: string[]): Promise<number> {
        const runner = this;
        const browser = this.browser;
        const mochaRunner = new Mocha(this.mochaOptions);
        mochaRunner.files = files;

        let counter = 1;

        return new Promise(async (resolve) => {
            mochaRunner.suite.beforeAll(async function () {
                this.timeout(getTimeout(browser.pageLoadTimeout));
                await browser.start();
                await runner.setup();
            });

            mochaRunner.suite.afterEach((async function () {
                this.timeout(30000);
                if (!this.currentTest?.isPassed()) {
                    try {
                        await runner.browser.takeScreenshot(
                            sanitize(`${this.currentTest?.title}`, {
                                replacement: `Test ${counter}`
                            }));
                    }
                    catch (e) {
                        console.warn(e);
                        await runner.browser.takeScreenshot(`Test ${counter}`);
                    }
                    counter++;
                }
            }));

            mochaRunner.suite.afterAll(async function () {
                this.timeout(getTimeout(browser.pageLoadTimeout));
                try {
                    await runner.browser.quit();
                }
                catch {
                    // browser is undefined, ignore
                }
            });

            mochaRunner.run(resolve);
        });
    }
}
