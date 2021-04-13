import { getTimeout, IViewItem, IViewPanelAction, IViewSection } from "extension-tester-page-objects";
import { WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { ViewContent } from "./ViewContent";
import { ViewPanelAction } from "./ViewPanelAction";

export abstract class ViewSection extends TheiaElement implements IViewSection {
    constructor(element: WebElement, parent: ViewContent = new ViewContent()) {
        super(element, parent);
    }
    
    abstract getVisibleItems(): Promise<IViewItem[]>;
    abstract findItem(label: string, maxLevel?: number): Promise<IViewItem | undefined>;
    abstract openItem(...path: string[]): Promise<IViewItem[]>;

    async getTitle(): Promise<string> {
        const fn = ViewSection.locators.components.sideBar.sections.section.constructor.properties?.title;

        if (fn) {
            return await fn(this, ViewContent.locators);
        }
        else {
            throw new Error('ViewSection.locators.components.sideBar.viewContent.sections.section.constructor.properties.title is undefined.');
        }
    }

    private async toggle(state: boolean): Promise<void> {
        if (await this.isExpanded() === state) {
            return;
        }
        
        const header = await this.findElement(ViewSection.locators.components.sideBar.sections.section.header.constructor);
        const toggle = await header.findElement(ViewSection.locators.components.sideBar.sections.section.header.toggle) as TheiaElement;
        await toggle.safeClick();
    }

    async expand(): Promise<void> {
        await this.toggle(true);
    }

    async collapse(): Promise<void> {
        await this.toggle(false);
    }

    async isExpanded(): Promise<boolean> {
        const fn = ViewSection.locators.components.sideBar.sections.section.constructor.properties?.collapsed;

        if (fn) {
            return !(await fn(this, ViewContent.locators));
        }
        else {
            throw new Error('ViewSection.locators.components.sideBar.viewContent.sections.section.constructor.properties.collapsed is undefined.');
        }
    }

    async getActions(): Promise<IViewPanelAction[]> {
        await this.getDriver().actions().mouseMove(this).perform();
        const locator = ViewSection.locators.components.sideBar.sections.section.header;

        const header = await this.findElement(locator.constructor);
        const toolbar = await header.findElements(locator.toolbar.constructor);

        if (toolbar.length === 0) {
            return [];
        }

        const items = await toolbar[0].findElements(locator.toolbar.action);
        return await Promise.all(items.map((item) => new ViewPanelAction(item, this)));
    }

    async getAction(label: string): Promise<IViewPanelAction> {
        return await this.getDriver().wait(async () => {
            const actions = await this.getActions();

            for (const action of actions) {
                if (await action.getLabel() === label) {
                    return action;
                }
            }
            return undefined;
        }, getTimeout(), `Could not find action with label "${label}".`) as IViewPanelAction;
    }
}
