import {
    ContextMenuItem,
    IMenu,
    IMenuItem,
    Menu,
    TheiaElement,
    WebElement
} from '../../../module';

export class ContextMenu extends Menu {

    constructor(element?: WebElement, parent?: IMenu, level: number = 0) {
        super(element || TheiaElement.locators.components.menu.contextMenu, undefined, level);
        this.enclosingItem = parent ?? this.enclosingItem;
    }

    async getItems(): Promise<IMenuItem[]> {
        const elements = await this.findElements(TheiaElement.locators.components.menu.contextMenuItem);
        const out: IMenuItem[] = [];

        for (const element of elements) {
            if (await element.getAttribute('data-type') !== 'separator') {
                out.push(new ContextMenuItem(element, this, this.level));
            }
        }
        return out;
    }
}
