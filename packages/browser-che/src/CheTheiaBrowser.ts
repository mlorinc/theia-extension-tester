import { TheiaBrowser } from '@theia-extension-tester/theia-browser';
import { TheiaElement } from '@theia-extension-tester/theia-element';
import { until } from 'extension-tester-page-objects';

/**
 * Eclipse Che browser implementation for [Eclipse Theia / Eclipse Che testers](https://www.npmjs.com/package/theia-extension-tester).
 * Browser objects are responsible for Selenium WebDriver creation, loading locators and attaching to workspace.
 * Currently two versions are primarily used [@theia-extension-tester/che-browser](https://www.npmjs.com/package/@theia-extension-tester/che-browser)
 * and [@theia-extension-tester/theia-browser](https://www.npmjs.com/package/@theia-extension-tester/theia-browser).
 *
 * @example
 *    import { CheTheiaBrowser, BrowserOptions, ITimeouts } from "@theia-extension-tester/che-browser";
 *    import { logging } from 'extension-tester-page-objects';
 *
 *    // It is recommended to use more specific browser mentioned above.
 *    const browser = new CheTheiaBrowser("chrome"), {
 *        // Optional path to browser binary.
 *        // If not specified PATH variable is used.
 *        browserLocation: "/path/to/browser",
 *        // Clean session after window is closed.
 *        cleanSession: true,
 *        // Optional path to Selenium WebDriver binary.
 *        // If not specified PATH variable is used.
 *        driverLocation: "/path/to/webdriver",
 *        // Selenium WebDriver log level.
 *        logLevel: logging.Level.INFO,
 *        // Timeouts used when testing.
 *        timeouts: {
 *            // Timeout after browser is attached to Eclipse Che editor.
 *            implicit: 30000,
 *            // Timeout before browser is attached to the editor.
 *            pageLoad: 120000
 *        }
 *    });
 */
export class CheTheiaBrowser extends TheiaBrowser {
    private mainWindowHandle?: string;

    protected isAttachedToFrame(): boolean {
        return this.mainWindowHandle !== undefined;
    }

    private async attachToFrame(timeout: number): Promise<void> {
        console.log('Attaching to Eclipse Che editor...');
        await this.driver.wait(until.ableToSwitchToFrame(TheiaElement.locators.widgets.editorFrame.locator), timeout);
        console.log('Successfully attached to Eclipse Che.');
        this.mainWindowHandle = await this.driver.getWindowHandle();
    }

    /**
     * Close active web browser tab and make main window active.
     * @param timeout Timeout in ms.
     * @returns A Selenium Window handle.
     */
    async closeCurrentBrowserTab(timeout?: number): Promise<string> {
        const newWindowHandle = await super.closeCurrentBrowserTab(timeout);

        if (this.mainWindowHandle === newWindowHandle) {
            // return back to original window with iframe
            await this.attachToFrame(this.timeouts.defaultTimeout(timeout));
        }

        return newWindowHandle;
    }

    async waitForWorkbench(timeout?: number): Promise<void> {
        console.log('Loading Che-Theia workbench...');
        timeout = this.timeouts.pageLoadTimeout(timeout);

        if (this.isAttachedToFrame() === false) {
            await this.attachToFrame(timeout);
        }

        try {
            console.log('Waiting for workbench to be ready...');
            await super.waitForWorkbench(timeout);

            // Workbench is ready but UI is still moving.
            // Make sure the yellow chevron is static.
            await this.driver.wait(async () => {
                const chevron = new TheiaElement(TheiaElement.locators.dashboard.cheChevron);
                try {
                    return (await chevron.getLocation()).x < 5;
                }
                catch {
                    return false;
                }
            }, timeout, 'Yellow chevron on top left is not on x = 0.');
            console.log('Workbench is ready.');
        }
        catch (e) {
            throw new Error(`${e} - Could not load Eclipse Che workbench. Increase timeout in browser.waitForWorkbench(timeout?: number).`);
        }
    }
}
