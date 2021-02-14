import { By, WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../TheiaElement";
import { ListItemWidget } from "./ListItemWidget";

export class ListWidget extends TheiaElement {
    constructor(parent: WebElement, element?: WebElement) {
        super(element || TheiaElement.locators.widgets.list.locator, parent);
    }

    async getListItems(): Promise<ListItemWidget[]> {
        return (await this.findElements(TheiaElement.locators.widgets.listItem.locator)).map((item) => new ListItemWidget(item, this));
    }

    /**
     * Search for a item in list
     * @param xpath xpath to be concatenated to TheiaAbstractElement.locators.widgets.list.locator
     */
    async getListItem(xpath: string): Promise<ListItemWidget> {
        return new ListItemWidget(await this.findElement(By.xpath(xpath)), this);
    }

    async getListItemByText(text: string): Promise<ListItemWidget> {
        return await this.getListItem(`.//*[text()='${text}']`);
    }

    async getListItemByIncludedText(text: string): Promise<ListItemWidget> {
        return await this.getListItem(`.//*[contains(text(), '${text}')]`);
    }
}
