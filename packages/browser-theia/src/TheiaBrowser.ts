import { BaseBrowser, BrowserOptions } from "@theia-extension-tester/base-browser";

/**
 * Eclipse Theia browser implementation for [Eclipse Theia / Eclipse Che testers](https://www.npmjs.com/package/theia-extension-tester).
 * Browser objects are responsible for Selenium WebDriver creation, loading locators and attaching to workspace.
 * Currently two versions are primarily used [@theia-extension-tester/che-browser](https://www.npmjs.com/package/@theia-extension-tester/che-browser)
 * and [@theia-extension-tester/theia-browser](https://www.npmjs.com/package/@theia-extension-tester/theia-browser).
 *
 * @example
 *    import { TheiaBrowser, BrowserOptions, ITimeouts } from "@theia-extension-tester/theia-browser";
 *    import { logging } from 'extension-tester-page-objects';
 *
 *    // It is recommended to use more specific browser mentioned above.
 *    return new TheiaBrowser("chrome"), {
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
 *            // Timeout after browser is attached to Eclipse Theia editor.
 *            implicit: 30000,
 *            // Timeout before browser is attached to the editor.
 *            pageLoad: 120000
 *        }
 *    });
 */
export class TheiaBrowser extends BaseBrowser {

    constructor(browserName: string, options: BrowserOptions) {
        options.distribution = options.distribution ?? 'theia';
        super(browserName, options);
    }

    /**
     * Close active web browser tab and make next active.
     * If last tab was closed then previous is set as active.
     * @param timeout Timeout in ms.
     * @returns A Selenium Window handle.
     */
    async closeCurrentBrowserTab(timeout?: number): Promise<string> {
        const currentHandle = await this.driver.getWindowHandle();
        const windowHandles = await this.driver.getAllWindowHandles();

        if (windowHandles.length === 1) {
            throw new Error('Cannot close last browser tab. It is not supported.');
        }

        const index = windowHandles.indexOf(currentHandle);
        let newWindowHandle: string = '';
        await this.driver.close();

        // if tab is last
        if (index + 1 === windowHandles.length) {
            newWindowHandle = windowHandles[index - 1];
        }
        else {
            newWindowHandle = windowHandles[index + 1];
        }
        await this.driver.switchTo().window(newWindowHandle);
        await this.waitForWorkbench(this.timeouts.pageLoadTimeout(timeout));
        return newWindowHandle;
    }
}
