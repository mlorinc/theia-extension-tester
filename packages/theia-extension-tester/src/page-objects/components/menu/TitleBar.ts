import {
    IMenuItem,
    Menu,
    TheiaElement,
    TitleBarItem,
    WindowControls
} from '../../../module';

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
