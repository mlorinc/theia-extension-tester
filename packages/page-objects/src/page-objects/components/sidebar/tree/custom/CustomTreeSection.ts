import {
    CustomTreeItem,
    ICustomTreeItem,
    ICustomTreeSection,
    TreeWidget,
    ViewContent,
    ViewSection,
    WebElement
} from '../../../../../module';

export class CustomTreeSection extends ViewSection implements ICustomTreeSection {
    private tree: CustomTree;

    constructor(element: WebElement, parent?: ViewContent) {
        super(element, parent);
        this.tree = new CustomTree(undefined, element);
    }

    async findItemByPath(...path: string[]): Promise<ICustomTreeItem> {
        const node = await this.tree.findItemByPath(path);
        return new CustomTreeItem(node, this);
    }

    async getVisibleItems(): Promise<ICustomTreeItem[]> {
        return await this.tree.getVisibleItems();
    }

    async openItem(...path: string[]): Promise<ICustomTreeItem[]> {
        const node = await this.findItemByPath(...path);
        await node.select();
        return [];
    }

    async findItem(label: string, maxLevel?: number): Promise<ICustomTreeItem> {
        throw new Error('Not implemented error');
    }
}

class CustomTree extends TreeWidget<CustomTreeItem> {
    protected getItems(): Promise<CustomTreeItem[]> {
        throw new Error("Method not implemented.");
    }
    async hasItems(): Promise<boolean> {
        return true;
    }
}
