import {
    By,
    getTimeout,
    SeleniumBrowser,
    TabsWidget,
    TabWidget,
    TheiaElement,
    until
} from '../module';
import Mocha = require('mocha');
import { MochaRunner } from './MochaRunner';
import { BaseBrowser } from '../browsers/BaseBrowser';

export interface WorkspaceTestRunnerOptions {
    mochaOptions?: Mocha.MochaOptions,
    workspaceName: string;
    devfileUrl?: string;
    devfileTemplate?: string;
    useExistingWorkspace?: boolean;
}

export class WorkspaceTestRunner extends MochaRunner {
    constructor(browser: BaseBrowser, protected options: WorkspaceTestRunnerOptions) {
        super(browser, options.mochaOptions);
    }

    protected async beforeAll(): Promise<void> {
        const timeout = getTimeout(this.browser.pageLoadTimeout) || 30000;
        const rawNavbar = await this.browser.driver.wait(
            until.elementLocated(TheiaElement.locators.dashboard.menu.locator), timeout
        );

        const navbar = new TheiaElement(rawNavbar);

        if (this.options.devfileUrl == null && this.options.devfileTemplate == null) {
            if (this.options.useExistingWorkspace) {
                const text = this.options.workspaceName.toLowerCase().replace(/\s+/g, '-');
                console.log(`Looking for workspace: ${text}`);

                await this.browser.driver.wait(async () => {
                    try {
                        const item = await navbar.findElement(By.xpath(`.//*[contains(text(), '${text}')]`)) as TheiaElement;
                        console.log(`Found workspace: ${await item.getText()}`);
                        await item.safeClick();
                        return true;
                    }
                    catch {
                        return false;
                    }
                }, timeout, `Could not click on ${this.options.workspaceName}.`);
            }
            else {
                throw new Error('Not supported.');
            }
        }
        else {
            const item = await navbar.findElement(By.xpath(`.//*[contains(text(), 'Get Started')]`)) as TheiaElement;
            await item.safeClick();

            const mainSection = new TheiaElement(TheiaElement.locators.dashboard.getStarted.mainSection);

            console.log('Searching tabs');
            const tabsWidget = new TabsWidget(mainSection);
            console.log('Get Started');
            const customWorkspaceTab: TabWidget = await tabsWidget.getTabByText('Custom Workspace');
            console.log('Custom Workspace');

            await customWorkspaceTab.safeClick();
        }

        await SeleniumBrowser.instance.waitForWorkbench();
    }
}
