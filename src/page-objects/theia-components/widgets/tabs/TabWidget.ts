import { WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../TheiaElement";
import { TabsWidget } from "./TabsWidget";

export class TabWidget extends TheiaElement {
    constructor(tab: WebElement, parent: TabsWidget) {
        super(tab, parent);
    }

    async isSelected(): Promise<boolean> {
        return (await this.getAttribute('class')).includes('md-active');
    }
}
