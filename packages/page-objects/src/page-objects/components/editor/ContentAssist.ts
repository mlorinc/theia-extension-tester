import {
    ContentAssistItem,
    IContentAssist,
    IMenu,
    IMenuItem,
    Key,
    MonacoScrollWidget,
    TextEditor,
    TheiaElement,
    until,
    By
} from '../../../module';
import { ScrollItemNotFound } from '../../theia-components/widgets/scrollable/ScrollableWidget';
import { repeat, TimeoutError } from "@theia-extension-tester/repeat";
import { error, WebElement } from 'extension-tester-page-objects';

export class ContentAssist extends MonacoScrollWidget<ContentAssistItem> implements IContentAssist {
    private editor: TheiaElement;

    constructor(element?: WebElement, parent: TheiaElement = new TextEditor()) {
        const container = parent.findElement(TheiaElement.locators.components.editor.contentAssist.constructor);
        super(element, container, true);
        this.editor = parent;
    }

    async hasItems(): Promise<boolean> {
        const element = await this.findElements(By.xpath(".//*[text() = 'No suggestions.']")).catch(() => [1]);
        return element.length === 0;
    }

    async getControllerElement(): Promise<TheiaElement> {
        return this.editor;
    }

    async getItem(name: string): Promise<IMenuItem> {
        try {
            return await repeat(async () => {
                try {
                    if (await this.isLoaded() === false) {
                        return false;
                    }

                    return await this.findItem(name);
                }
                catch (e) {
                    if (e instanceof ScrollItemNotFound) {
                        return false;
                    }
                    throw e;
                }
            }, {
                timeout: this.timeoutManager().findElementTimeout(),
                message: `Could not find content assist item with name "${name}".`
            }) as IMenuItem;
        }
        catch (e) {
            if (e instanceof TimeoutError && await this.isLoaded() === false) {
                e.appendMessage('Content assist was not loaded on time.');
            }
            throw e;
        }
    }

    async hasItem(name: string): Promise<boolean> {
        try {
            if (await this.isLoaded() === false) {
                return false;
            }

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
                if (e instanceof error.StaleElementReferenceError) {
                    return false;
                }
                throw e;
            }

            return false;
        }, {
            timeout: this.timeoutManager().defaultTimeout(),
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
        return await this.isDisplayed() && ((elements.length === 0) || (elements.length === 1 && await elements[0].isDisplayed() === false));
    }

    async isEnabled(): Promise<boolean> {
        return await this.isLoaded();
    }

    async isDisplayed(): Promise<boolean> {
        const size = await this.getSize();
        return await super.isDisplayed() && size.height > 0;
    }

    static async isOpen(parent: TheiaElement = new TextEditor()): Promise<boolean> {
        const elements = await parent.findElements(TheiaElement.locators.components.editor.contentAssist.constructor);

        if (elements.length === 0) {
            return false;
        }

        const menu = new ContentAssist(elements[0], parent);
        return elements.length === 1 && await menu.isDisplayed().catch(() => false);
    }

    private async findItem(label: string, timeout?: number): Promise<ContentAssistItem> {
        if (await this.isLoaded() === false) {
            throw new Error('Content assist has not been loaded.');
        }

        async function predicate(item: ContentAssistItem): Promise<boolean> {
            return await item.getLabel() === label;
        }

        const errorMessage = `Could not find content assist item with label "${label}".`;

        await this.getDriver().wait(until.elementIsEnabled(this), this.timeoutManager().defaultTimeout(timeout));

        return await this.findItemSequentially(
            predicate.bind(this),
            this.timeoutManager().findElementTimeout(timeout),
            errorMessage
        );
    }
}
