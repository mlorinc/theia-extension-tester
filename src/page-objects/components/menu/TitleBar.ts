import { By, WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { ContextMenu } from "./ContextMenu";
import { Menu } from "./Menu";
import { WindowControls } from "./WindowControls";

export class TitleBar extends Menu {
    constructor() {
        super(TheiaElement.locators.components.menu.titleBar.locator);
    }

    protected itemQuery(name?: string): By {
        if (name) {
            return TheiaElement.locators.components.menu.titleBarItemByLabel.locator({name});
        }
        else {
            return TheiaElement.locators.components.menu.titleBarItem.locator as By;
        }
    }

    protected createItem(element: WebElement): Menu {
        return new ContextMenu(element, this);
    }

    async getTitle(): Promise<string> {
        return '';
    }

    getWindowControls(): WindowControls {
        return new WindowControls();
    }
}
