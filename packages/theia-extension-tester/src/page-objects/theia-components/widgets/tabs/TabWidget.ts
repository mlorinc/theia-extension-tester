import { TabsWidget, TheiaElement, WebElement } from '../../../../module';

export class TabWidget extends TheiaElement {
    constructor(tab: WebElement, parent: TabsWidget) {
        super(tab, parent);
    }
}
