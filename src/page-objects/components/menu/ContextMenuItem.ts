import { IMenu, SeleniumBrowser } from "extension-tester-page-objects";
import { WebDriver, WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { ContextMenu } from "./ContextMenu";
import { MenuItem } from "./MenuItem";

export class ContextMenuItem extends MenuItem {
    constructor(element: WebElement, parent: IMenu, protected level: number) {
        super(element, parent);
    }

    protected async getMenu(): Promise<ContextMenu | undefined> {
        const menus = await findMenus(this.getDriver());

        if (menus.length <= this.level + 1) {
            return undefined;
        }

        return new ContextMenu(menus[this.level + 1], this.enclosingItem as IMenu, this.level + 1);
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
        }, SeleniumBrowser.instance.findElementTimeout, `Could find expanded context menu: "${await this.getLabel()}".`) as ContextMenu;
    }

    async isNesting(): Promise<boolean> {
        return await this.isExpandable();
    }
}

async function findMenus(driver: WebDriver): Promise<WebElement[]> {
    return driver.findElements(TheiaElement.locators.components.menu.contextMenu.locator);
}
