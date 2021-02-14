import { Locator, WebElement } from "selenium-webdriver";
import { TheiaLocator } from "../../../../locators/TheiaLocators";
import { TheiaElement } from "../../TheiaElement";

export abstract class ScrollableWidget extends TheiaElement {
    constructor(element: WebElement | Locator | TheiaLocator, parent?: WebElement | Locator | TheiaLocator) {
        super(element, parent);
    }

    abstract next(): Promise<TheiaElement>;
    abstract previous(): Promise<TheiaElement>;
    abstract itemsLength(): Promise<number>;
}
