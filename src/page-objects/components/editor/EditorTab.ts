import { IEditorTab } from "extension-tester-page-objects";
import { Button, until, WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { ContextMenu } from "../menu/ContextMenu";
import { Menu } from "../menu/Menu";
import { EditorView } from "./EditorView";

export class EditorTab extends TheiaElement implements IEditorTab {
    constructor(element: WebElement, editor: EditorView) {
        super(element, editor);
    }

    async getTitle(): Promise<string> {
        return (await this.findElement(TheiaElement.locators.components.editor.editorTabLabel.locator)).getText();
    }

    async select(): Promise<void> {
        await this.getDriver().wait(async () => {
            await this.click();
            return await this.isSelected();
        });
    }

    async openContextMenu(): Promise<Menu> {
        await this.getDriver().actions().click(this, Button.RIGHT).perform();
        const menus = await this.getDriver().findElements(TheiaElement.locators.components.menu.contextMenu.locator);
        return new ContextMenu(menus[0], this);
    }

    async isSelected(): Promise<boolean> {
        return (await this.getAttribute('class')).includes('p-mod-current');
    }

    async close(): Promise<void> {
        const button = await this.findElement(TheiaElement.locators.components.editor.editorTabClose.locator);
        await button.click();
        await this.getDriver().wait(until.stalenessOf(this));
    }
}
