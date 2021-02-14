import { WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../TheiaElement";
import { TabsWidget } from "./TabsWidget";

export class TabsContentWidget extends TheiaElement {
    constructor(element: WebElement, parent: TabsWidget) {
        super(element, parent);
    }
    
    async isSelected(): Promise<boolean> {
        return (await this.getAttribute('class')).includes('md-active');
    }
}
