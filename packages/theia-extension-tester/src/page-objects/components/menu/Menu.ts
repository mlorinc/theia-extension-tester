import { IMenu, SeleniumBrowser } from "extension-tester-page-objects";
import { By, Key, Locator, WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { ContextMenu } from "./ContextMenu";

export abstract class Menu extends TheiaElement implements IMenu {
    constructor(element: WebElement | Locator, parent?: WebElement | Locator) {
        super(element, parent);
    }

    protected abstract itemQuery(name?: string): By;
    protected abstract createItem(element: WebElement): IMenu;

    async hasItem(name: string): Promise<boolean> {
        try {
            await this.getItem(name);
            return true;
        }
        catch {
            return false;
        }
    }

    async getItem(name: string): Promise<IMenu> {
        const query = this.itemQuery(name)
        const element = await this.findElement(query);
        return this.createItem(element);
    }

    async getItems(): Promise<IMenu[]> {
        const elements = await this.findElements(this.itemQuery());
        return elements.map(this.createItem);
    }

    async select(...path: string[]): Promise<IMenu | undefined> {
        let currentMenu: IMenu = this;
        let level = 0;
        for (const item of path) {
            const menuItem = await currentMenu.getItem(item);
            await menuItem.waitInteractive(await SeleniumBrowser.instance.getImplicitTimeout());
            await menuItem.click();
            
            if (path.length > level + 1) {
                const menus = await this.getDriver().findElements(TheiaElement.locators.components.menu.contextMenu.locator);
                currentMenu = new ContextMenu(menus[level], menuItem);
                level++;
            }
        }
        return currentMenu;
    }

    async close(): Promise<void> {
        await this.sendKeys(Key.ARROW_LEFT);
    }

    async getLabel(): Promise<string> {
        return await (await this.findElement(TheiaElement.locators.components.menu.label.locator)).getText();
    }
}
