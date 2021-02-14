import { WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../TheiaElement";
import { ListWidget } from "./ListWidget";

export class ListItemWidget extends TheiaElement {
    constructor(element: WebElement, parent: ListWidget) {
        super(element, parent);
    }
}
