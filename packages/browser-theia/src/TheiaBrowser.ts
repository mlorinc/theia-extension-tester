import { BaseBrowser } from "@theia-extension-tester/base-browser";

export class TheiaBrowser extends BaseBrowser {
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
