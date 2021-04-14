import {
    Button,
    By,
    ContextMenu,
    FileTreeNode,
    IDefaultTreeItem,
    IMenu,
    ITreeItem,
    IViewItemAction,
    TheiaElement,
    WebElement
} from '../../../../../module';

export class DefaultTreeItem extends FileTreeNode implements IDefaultTreeItem {
    constructor(element: TheiaElement, parent: TheiaElement) {
        super(element, parent);
    }

    async isFile(): Promise<boolean> {
        return await this.isExpandable() === false;
    }
    async isFolder(): Promise<boolean> {
        return await this.isExpandable() === true;
    }

    async getLabel(): Promise<string> {
        const element = await this.findElement(DefaultTreeItem.locators.widgets.tree.file.label);
        return await element.getText();
    }

    async hasChildren(): Promise<boolean> {
        if (await this.isExpandable() === false) {
            return false;
        }

        return (await this.getChildren()).length > 0;
    }
    async getChildren(): Promise<ITreeItem[]> {
        throw new Error('Not implemented error.');
    }

    async findChildItem(name: string): Promise<ITreeItem> {
        throw new Error("Method not implemented.");
    }

    getActionButtons(): Promise<IViewItemAction[]> {
        throw new Error("Method not implemented.");
    }

    getActionButton(label: string): Promise<IViewItemAction> {
        throw new Error("Method not implemented.");
    }

    async getChildItems(locator: By): Promise<WebElement[]> {
        return this.findElements(locator);
    }

    async select(): Promise<void> {
        await this.safeClick();
    }

    async openContextMenu(): Promise<IMenu> {
        await this.safeClick(Button.RIGHT);
        return new ContextMenu();
    }
}
