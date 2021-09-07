import {
    IMenu,
    IMenuItem,
    Key,
    Locator,
    TheiaElement,
    WebElement
} from '../../../module';

export abstract class Menu extends TheiaElement implements IMenu {
    constructor(element: WebElement | Locator, parent?: WebElement, protected level: number = 0) {
        super(element, parent);
    }

    async getItem(name: string, timeout?: number): Promise<IMenuItem> {
        return await this.getDriver().wait(async () => {
            try {
                for (const item of await this.getItems()) {
                    if (await item.getLabel() === name) {
                        return item;
                    }
                }
                return undefined;
            }
            catch {
                return undefined;
            }
        }, this.timeoutManager().findElementTimeout(timeout), `Could not find item "${name}".`) as IMenuItem;
    }

    abstract getItems(): Promise<IMenuItem[]>;

    async hasItem(name: string): Promise<boolean> {
        try {
            for (const item of await this.getItems()) {
                if (await item.getLabel() === name) {
                    return true;
                }
            }
            return false;
        }
        catch {
            return false;
        }
    }

    async select(...path: string[]): Promise<IMenu | undefined> {
        let currentMenu: IMenu = this;
        for (const item of path) {
            const menuItem = await currentMenu.getItem(item);

            if (menuItem === undefined) {
                throw new Error('Unexpected undefined menu item.');
            }

            const subMenu = await menuItem.select();
            if (subMenu === undefined) {
                return undefined;
            }
            currentMenu = subMenu;
        }

        return currentMenu;
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
        }, this.timeoutManager().defaultTimeout(), 'Could not close menu.');
    }
}
