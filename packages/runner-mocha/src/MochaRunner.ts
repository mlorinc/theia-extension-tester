import Mocha = require('mocha');
import sanitize = require('sanitize-filename');
import { TestRunner } from 'extension-tester-page-objects';
import { BaseBrowser } from "@theia-extension-tester/base-browser";

/**
 * Run tests with Mocha library.
 */
export class MochaRunner implements TestRunner {
    private testCounter: number = 1;
    private exitListener?: (...args: any[]) => void;

    constructor(protected browser: BaseBrowser, protected mochaOptions?: Mocha.MochaOptions) {
    }

    protected async beforeAll(mochaContext: Mocha.Context): Promise<void> {
        mochaContext.timeout(this.browser.timeouts.pageLoadTimeout());
        await this.browser.start();
        this.exitListener = this.afterAll.bind(this, mochaContext);
        process.on('exit', this.exitListener);
        process.on('SIGINT', this.exitListener);
    }

    protected async afterAll(mochaContext: Mocha.Context): Promise<void> {
        mochaContext.timeout(this.browser.timeouts.pageLoadTimeout());
        try {
            await this.browser.quit();
        }
        catch {
            // browser is undefined, ignore
        }
    }

    protected async beforeEach(mochaContext: Mocha.Context): Promise<void> {}

    protected async afterEach(mochaContext: Mocha.Context): Promise<void> {
        mochaContext.timeout(30000);
        if (!mochaContext.currentTest?.isPassed()) {
            try {
                await this.browser.takeScreenshot(
                    sanitize(`${mochaContext.currentTest?.title}`, {
                        replacement: `Test ${this.testCounter}`
                    }));
            }
            catch (e) {
                console.warn(e);
                await this.browser.takeScreenshot(`Test ${this.testCounter}`);
            }
            this.testCounter++;
        }
    }

    async runTests(files: string[]): Promise<number> {
        const runner = this;
        const mochaRunner = new Mocha(this.mochaOptions);
        mochaRunner.files = files;
        
        return new Promise(async (resolve) => {
            mochaRunner.suite.beforeAll(async function () {
                await runner.beforeAll.call(runner, this);
            });

            mochaRunner.suite.beforeEach(async function () {
                await runner.beforeEach.call(runner, this);
            });

            mochaRunner.suite.afterAll(async function () {
                await runner.afterAll.call(runner, this);
            });

            mochaRunner.suite.afterEach(async function () {
                await runner.afterEach.call(runner, this);
            });

            mochaRunner.run(resolve);
        });
    }
}
