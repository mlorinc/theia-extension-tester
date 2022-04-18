import Mocha = require('mocha');
import sanitize = require('sanitize-filename');
import { error, TestRunner } from 'extension-tester-page-objects';
import { BaseBrowser } from "@theia-extension-tester/base-browser";
import { RepeatExitError } from "@theia-extension-tester/repeat";

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
        process.on('uncaughtException', (e) => {
            // all tasks on end are aborted, ignore abort errors
            if (e instanceof RepeatExitError) {
                return;
            }
            process.exitCode = (process.exitCode !== undefined) ? (process.exitCode) : (1);
            console.error(e);
        });
        try {
            await this.browser.quit();
        }
        catch {
            // browser is undefined, ignore
        }
        finally {
            process.exitCode = process.exitCode ?? 0;
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
                if (e instanceof error.NoSuchSessionError) {
                    // cannot recover
                    return;
                }
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
        mochaRunner.fullTrace();
        mochaRunner.slow(5000);

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
