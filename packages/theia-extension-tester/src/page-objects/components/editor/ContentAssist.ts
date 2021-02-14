import { By, WebElement } from "selenium-webdriver";
import { TextEditor, TheiaElement } from "../../..";
import { Menu } from "../menu/Menu";

export class ContentAssist extends Menu {
    constructor(element?: WebElement) {
        super(element || TheiaElement.locators.components.editor.contentAssist.locator, new TextEditor());
    }

    protected itemQuery(name?: string): By {
        if (name) {
            return TheiaElement.locators.components.editor.contentAssistMenuItemByLabel.locator({name});
        }
        else {
            return TheiaElement.locators.components.editor.contentAssistMenuItem.locator;
        }
    }
    protected createItem(element: WebElement): Menu {
        return new ContentAssist(element);
    }

    /**
     * Find if the content assist is still loading the suggestions
     * @returns promise that resolves to true when suggestions are done loading,
     * to false otherwise
     */
    async isLoaded(): Promise<boolean> {
        throw new Error('Not supported');
    }
}
