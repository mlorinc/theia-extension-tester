import { repeat } from '@theia-extension-tester/repeat';
import {
    IViewItem,
    IViewPanelAction,
    IViewSection,
    TheiaElement,
    ViewContent,
    ViewPanelAction,
    WebElement
} from '../../../module';

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

        let lastHeight = (await this.getSize()).height;
        await repeat(async () => {
            const height = (await this.getSize()).height;
            const result = Math.abs(lastHeight - height) < Number.EPSILON; 
            lastHeight = height;
            return result;
        }, {
            timeout: this.timeoutManager().findElementTimeout(),
            threshold: 400,
            message: `Could not ${state ? 'expand' : 'collapse'} section.`
        });
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

        await this.getDriver().actions().mouseMove(toolbar[0]).perform();
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
        }, this.timeoutManager().findElementTimeout(), `Could not find action with label "${label}".`) as IViewPanelAction;
    }
}
