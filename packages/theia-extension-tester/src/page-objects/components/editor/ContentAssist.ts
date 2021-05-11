import {
    ContentAssistItem,
    getTimeout,
    IContentAssist,
    IMenu,
    IMenuItem,
    Key,
    MonacoScrollWidget,
    repeat,
    TextEditor,
    TheiaElement,
    until
} from '../../../module';
import { ScrollItemNotFound } from '../../theia-components/widgets/scrollable/ScrollableWidget';

export class ContentAssist extends MonacoScrollWidget<ContentAssistItem> implements IContentAssist {
    private editor: TheiaElement;

    constructor(parent: TheiaElement = new TextEditor()) {
        const container = parent.findElement(TheiaElement.locators.components.editor.contentAssist.constructor);
        super(undefined, container, true);
        this.editor = parent;
    }

    async getControllerElement(): Promise<TheiaElement> {
        return this.editor;
    }

    async getItem(name: string): Promise<IMenuItem> {
        return await repeat(async () => {
            try {
                return await this.findItem(name);
            }
            catch (e) {
                if (e instanceof ScrollItemNotFound) {
                    return false;
                }
                throw e;
            }
        }, {
            timeout: getTimeout(),
            message: `Could not find content assist item with name "${name}".`
        }) as IMenuItem;
    }

    async hasItem(name: string): Promise<boolean> {
        try {
            await this.findItem(name, 0);
            return true;
        }
        catch (e) {
            if (e instanceof ScrollItemNotFound) {
                return false;
            }
            throw e;
        }
    }

    async select(...path: string[]): Promise<IMenu | undefined> {
        const menuItem = await this.getItem(path[0]);
        await menuItem.select()
        return undefined;
    }

    async close(): Promise<void> {
        await repeat(async () => {
            if (await ContentAssist.isOpen(this.editor) === false) {
                return true;
            }

            try {
                // safe send keys does not work well in this scenario
                await this.editor.sendKeys(Key.ESCAPE);
            }
            catch (e) {
                if (e.message.includes('element not interactable')) {
                    return false;
                }
                throw e;
            }

            return false;
        }, {
            timeout: getTimeout(),
            message: 'Could not close content assist menu.'
        });
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

    async isDisplayed(): Promise<boolean> {
        await this.getDriver().wait(() => this.enclosingItem, getTimeout());
        return await this.enclosingItem.isDisplayed() && await super.isDisplayed();
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
