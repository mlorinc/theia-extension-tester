import { IMenuItem } from "extension-tester-page-objects";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { Menu } from "./Menu";
import { TitleBarItem } from "./TitleBarItem";
import { WindowControls } from "./WindowControls";

export class TitleBar extends Menu {
    constructor() {
        super(TheiaElement.locators.components.menu.titleBar.locator);
    }

    async getItems(): Promise<IMenuItem[]> {
        const items = await this.findElements(TheiaElement.locators.components.menu.titleBarItem);
        return items.map((element) => new TitleBarItem(element, this));
    }

    async getTitle(): Promise<string> {
        return '';
    }

    getWindowControls(): WindowControls {
        return new WindowControls();
    }
}
