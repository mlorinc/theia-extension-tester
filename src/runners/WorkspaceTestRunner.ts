import { DashboardTestRunner } from './DashboardTestRunner';
import Mocha = require('mocha');
import { TheiaElement } from '../page-objects/theia-components/TheiaElement';
import { TabsWidget } from '../page-objects/theia-components/widgets/tabs/TabsWidget';
import { ListWidget } from '../page-objects/theia-components/widgets/list/ListWidget';
import { TabWidget } from '../page-objects/theia-components/widgets/tabs/TabWidget';
import { hasClass } from '../locators/TheiaLocators';
import { SeleniumBrowser } from 'extension-tester-page-objects';
import { By } from 'selenium-webdriver';

export interface WorkspaceTestRunnerOptions {
    mochaOptions?: Mocha.MochaOptions,
    workspaceName: string;
    devfileUrl?: string;
    devfileTemplate?: string;
    useExistingWorkspace?: boolean;
}

export class WorkspaceTestRunner extends DashboardTestRunner {
    constructor(browser: SeleniumBrowser, protected options: WorkspaceTestRunnerOptions) {
        super(browser, options.mochaOptions);
    }

    protected async setup(): Promise<void> {
        const driver = this.browser.driver;
        const navbar = await driver.findElement(TheiaElement.locators.dashboard.menu.locator);

        const menu = new ListWidget(navbar);
        const item = await menu.getListItemByText('Get Started Page');
        await item.click();
        
        const mainSection = await driver.findElement(TheiaElement.locators.dashboard.getStarted.mainSection.locator);

        console.log('Searching tabs');
        const tabsWidget = new TabsWidget(mainSection);
        console.log('Found tabs');
        const getStartedTab: TabWidget = await tabsWidget.getTabByText('Get Started');
        console.log('Get Started');
        const customWorkspaceTab: TabWidget = await tabsWidget.getTabByText('Custom Workspace');
        console.log('Custom Workspace');

        if (this.options.devfileUrl == null && this.options.devfileTemplate == null) {
            if (this.options.useExistingWorkspace) {
                const text = this.options.workspaceName.toLowerCase().replace(/\s+/g, '-');
                console.log(`Looking for workspace: ${text}`);
                const item = await menu.getListItemByIncludedText(text);
                console.log(`Found workspace: ${await item.getText()}`);
                await item.click();
            }
            else {
                await getStartedTab.click();
                const input = await driver.findElement(By.xpath('.//input[@aria-label="Filter samples list"]'));
                await input.sendKeys(this.options.workspaceName);
                const stackCard = await driver.findElement(By.xpath(`.//*[${hasClass('pf-l-gallery')}]//article//*[text()="${this.options.workspaceName}"]`));
                await stackCard.click();
            }
        } 
        else {
            await customWorkspaceTab.click();
        }
        await SeleniumBrowser.instance.waitForWorkbench();
    }
}
