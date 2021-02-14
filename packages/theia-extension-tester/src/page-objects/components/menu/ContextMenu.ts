import { By, Key, WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { Menu } from "./Menu";

export class ContextMenu extends Menu {
    constructor(element: WebElement, parent: WebElement) {
        super(element, parent);
    }

    protected itemQuery(name?: string): By {
        if (name) {
            return TheiaElement.locators.components.menu.contextMenuItemByLabel.locator({name});
        }
        else {
            return TheiaElement.locators.components.menu.contextMenuItem.locator;
        }
    }
    protected createItem(element: WebElement): Menu {
        return new ContextMenu(element, this);
    }

    async close(): Promise<void> {
        await this.sendKeys(Key.ARROW_LEFT);
    }
}
