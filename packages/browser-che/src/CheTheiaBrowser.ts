import { TheiaBrowser } from '@theia-extension-tester/theia-browser';
import { TheiaElement } from '@theia-extension-tester/theia-element';
import { until } from 'extension-tester-page-objects';

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
