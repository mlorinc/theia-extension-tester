import {
    By,
    TabsContentWidget,
    TabWidget,
    TheiaElement,
    WebElement
} from '../../../../module';

export class TabsWidget extends TheiaElement {
    constructor(parent: WebElement, element?: WebElement) {
        super(element || TheiaElement.locators.widgets.tabs.locator, parent);
    }

    async getTabs(): Promise<TabWidget[]> {
        return (await this.findElements(TabsWidget.locators.widgets.tab.locator)).map((tab) => new TabWidget(tab, this));
    }

    async getTab(xpath: string): Promise<TabWidget> {
        return new TabWidget(await this.findElement(By.xpath(xpath)), this);
    }

    async getTabByText(text: string): Promise<TabWidget> {
        return await this.getTab(`.//*[text()='${text}']`);
    }

    async getSelectedTab(): Promise<TabWidget> {
        for (const tab of await this.getTabs()) {
            if (await tab.isSelected()) {
                return tab;
            }
        }
        return Promise.reject('Could not find selected tab');
    }

    async getContentPanels(): Promise<TabsContentWidget[]> {
        return (await this.findElements(TabsWidget.locators.widgets.tabContent.locator)).map((panel) => new TabsContentWidget(panel, this));
    }

    async getSelectedContent(): Promise<TabsContentWidget> {
        for (const panel of await this.getContentPanels()) {
            if (await panel.isSelected()) {
                return panel;
            }
        }
        return Promise.reject('Could not find selected content widget');
    }
}
