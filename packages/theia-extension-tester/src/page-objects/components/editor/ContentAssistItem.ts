import { IContentAssistItem, IMenu } from "extension-tester-page-objects";
import { WebElement } from "selenium-webdriver";
import { MenuItem } from "../menu/MenuItem";

export class ContentAssistItem extends MenuItem implements IContentAssistItem {
    constructor(element: WebElement, parent: IMenu) {
        super(element, parent);
    }

    async getLabel(): Promise<string> {
        const element = await this.findElement(ContentAssistItem.locators.components.editor.contentAssist.itemLabel);
        return await element.getText();
    }

    getNextMenu(): Promise<IMenu> {
        throw new Error("Method not implemented.");
    }
    
    async isNesting(): Promise<boolean> {
        return false;
    }
}
