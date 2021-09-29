import {
    ContextMenuItem,
    IContextMenu,
    IMenu,
    IMenuItem,
    Key,
    Menu,
    TheiaElement,
    WebElement
} from '../../../module';

export class ContextMenu extends Menu implements IContextMenu {

    constructor(element?: WebElement, parent?: IMenu, protected level: number = 0) {
        super(element || TheiaElement.locators.components.menu.contextMenu, undefined);
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

    async close(): Promise<void> {
        await this.getDriver().wait(async () => {
            try {
                if (await this.isDisplayed() === false) {
                    return true;
                }

                await this.sendKeys(Key.ESCAPE);
                return false;
            }
            catch {
                return true;
            }
        }, this.timeoutManager().defaultTimeout(), 'Could not close context menu.');
    }
}
