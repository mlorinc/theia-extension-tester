import { IMenu, IViewItem } from "extension-tester-page-objects";
import { Button, WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { ContextMenu } from "../menu/ContextMenu";

export class ViewItem extends TheiaElement implements IViewItem {
    constructor(element: WebElement, parent?: WebElement) {
        super(element, parent);
    }

    async select(): Promise<void> {
        await this.safeClick();
    }
    async openContextMenu(): Promise<IMenu> {
        await this.safeClick(Button.RIGHT);
        return new ContextMenu();
    }
}
