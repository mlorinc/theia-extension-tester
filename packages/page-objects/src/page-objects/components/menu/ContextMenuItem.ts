import {
    ContextMenu,
    IMenu,
    Menu,
    MenuItem,
    TheiaElement,
    WebDriver,
    WebElement
} from '../../../module';

export class ContextMenuItem extends MenuItem {
    constructor(element: WebElement, parent: IMenu, protected level: number) {
        super(element, parent);
    }

    protected async getMenu(): Promise<ContextMenu | undefined> {
        const menus = await findMenus(this.getDriver());

        if (menus.length <= this.level + 1) {
            return undefined;
        }

        const menu = await this.enclosingItem;

        if (menu instanceof Menu) {
            return new ContextMenu(menus[this.level + 1], (await this.enclosingItem as IMenu), this.level + 1);
        }

        throw new Error('Enclosing item must be instance of Menu page object.');
    }

    async getNextMenu(): Promise<IMenu> {
        return await this.getDriver().wait(async () => {
            try {
                return await this.getMenu();
            }
            catch (e) {
                console.error(e);
                return undefined;
            }
        }, this.timeoutManager().findElementTimeout(), `Could find expanded context menu: "${await this.getLabel()}".`) as ContextMenu;
    }

    async isNesting(): Promise<boolean> {
        return await this.isExpandable();
    }
}

async function findMenus(driver: WebDriver): Promise<WebElement[]> {
    return driver.findElements(TheiaElement.locators.components.menu.contextMenu.locator);
}
