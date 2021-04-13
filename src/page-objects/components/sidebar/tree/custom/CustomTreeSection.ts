import { ICustomTreeItem, ICustomTreeSection } from "extension-tester-page-objects";
import { WebElement } from "selenium-webdriver";
import { ScrollDirection } from "../../../../theia-components/widgets/scrollable/ScrollableWidget";
import { FileTreeWidget } from "../../../../theia-components/widgets/tree/FileTreeWidget";
import { ViewContent } from "../../ViewContent";
import { ViewSection } from "../../ViewSection";
import { CustomTreeItem } from "./CustomTreeItem";

export class CustomTreeSection extends ViewSection implements ICustomTreeSection  {
    private tree: FileTreeWidget;

    constructor(element: WebElement, parent?: ViewContent) {
        super(element, parent);
        this.tree = new FileTreeWidget(undefined, element);
    }

    async findItemByPath(...path: string[]): Promise<ICustomTreeItem> {
        const node = await this.tree.findNodeByPath({
            direction: ScrollDirection.NEXT,
            path
        });
        return new CustomTreeItem(node);
    }

    async getVisibleItems(): Promise<ICustomTreeItem[]> {
        const items = await this.tree.getVisibleItems();
        return Promise.all(items.map((item) => new CustomTreeItem(item)));
    }

    async openItem(...path: string[]): Promise<ICustomTreeItem[]> {
        const node = await this.findItemByPath(...path);
        console.log('Created last node');
        await node.select();
        console.log('Clicked last node');
        return [];
    }

    async findItem(label: string, maxLevel?: number): Promise<ICustomTreeItem> {
        throw new Error('Not implemented error');
    }
}
