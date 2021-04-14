import { ListWidget, TheiaElement, WebElement } from '../../../../module';

export class ListItemWidget extends TheiaElement {
    constructor(element: WebElement, parent: ListWidget) {
        super(element, parent);
    }
}
