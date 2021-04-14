import {
    ContentAssistItem,
    getTimeout,
    IContentAssist,
    IMenu,
    IMenuItem,
    Key,
    MonacoScrollWidget,
    TextEditor,
    TheiaElement,
    until
} from '../../../module';

export class ContentAssist extends MonacoScrollWidget<ContentAssistItem> implements IContentAssist {
    constructor(parent: TheiaElement = new TextEditor()) {
        const container = parent.findElement(TheiaElement.locators.components.editor.contentAssist.constructor);
        super(undefined, container);
    }

    getItem(name: string): Promise<IMenuItem> {
        return this.findItem(name);
    }

    async hasItem(name: string): Promise<boolean> {
        try {
            await this.findItem(name, 0);
            return true;
        }
        catch {
            return false;
        }
    }

    async select(...path: string[]): Promise<IMenu | undefined> {
        let currentMenu: IMenu = this;
        for (const item of path) {
            const menuItem = await currentMenu.getItem(item);

            if (menuItem === undefined) {
                throw new Error('Unexpected undefined menu item.');
            }

            const subMenu = await menuItem.select();
            if (subMenu === undefined) {
                return undefined;
            }
            currentMenu = subMenu;
        }

        return currentMenu;
    }

    async close(): Promise<void> {
        await this.sendKeys(Key.ESCAPE);
        try {
            await this.getDriver().wait(until.elementIsNotVisible(this), getTimeout());
        }
        catch {
            await this.getDriver().wait(until.stalenessOf(this), getTimeout());
        }
    }

    protected async mapItem(element: TheiaElement): Promise<ContentAssistItem> {
        return new ContentAssistItem(element, this);
    }

    length(): Promise<number> {
        throw new Error("Method not implemented.");
    }

    /**
     * Find if the content assist is still loading the suggestions
     * @returns promise that resolves to true when suggestions are done loading,
     * to false otherwise
     */
    async isLoaded(): Promise<boolean> {
        const elements = await this.findElements(ContentAssist.locators.components.editor.contentAssist.loading);
        return (elements.length === 0) || (elements.length === 1 && await elements[0].isDisplayed() === false);
    }

    async isEnabled(): Promise<boolean> {
        return await this.isLoaded();
    }

    static async isOpen(parent: TheiaElement = new TextEditor()): Promise<boolean> {
        const elements = await parent.findElements(TheiaElement.locators.components.editor.contentAssist.constructor);

        if (elements.length === 0) {
            return false;
        }

        const classes = await elements[0].getAttribute('class');
        return elements.length === 1 && elements[0].isDisplayed() && classes.includes('visible');
    }

    private async findItem(label: string, timeout?: number): Promise<ContentAssistItem> {
        async function predicate(item: ContentAssistItem): Promise<boolean> {
            return await item.getLabel() === label;
        }

        const errorMessage = `Could not find content assist item with label "${label}".`;

        await this.getDriver().wait(until.elementIsEnabled(this), getTimeout(timeout));

        return await this.findItemSequentially(
            predicate.bind(this),
            getTimeout(timeout),
            errorMessage
        );
    }
}
