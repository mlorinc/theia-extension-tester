import {
    Button,
    ContextMenu,
    IContextMenu,
    IViewItem,
    TheiaElement,
    WebElement
} from '../../../module';

export class ViewItem extends TheiaElement implements IViewItem {
    constructor(element: WebElement, parent?: WebElement) {
        super(element, parent);
    }

    async select(): Promise<void> {
        await this.safeClick();
    }
    async openContextMenu(): Promise<IContextMenu> {
        await this.safeClick(Button.RIGHT);
        return new ContextMenu();
    }
}
