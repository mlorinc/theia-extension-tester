import { TreeItemNotFound } from "extension-tester-page-objects";
import { WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../TheiaElement";
import { FileTreeNode } from "./FileTreeNode";
import { TreeWidget } from "./TreeWidget";

export class FileTreeWidget extends TreeWidget<FileTreeNode> {
    constructor(element: WebElement | undefined, parent?: WebElement) {
        super(element, parent);
    }

    public async getItems(): Promise<FileTreeNode[]> {
        const elements = await this.findElements(FileTreeWidget.locators.widgets.tree.nodeWrapper) as TheiaElement[];
        const items = [];

        for (const element of elements) {
            try {
                const node = await element.findElements(FileTreeWidget.locators.widgets.tree.node) as TheiaElement[];

                if (node.length === 0) {
                    continue;
                }

                if (node.length > 1) {
                    throw new TreeItemNotFound([], 'Tree node wrapper has more child nodes than expected. Unexpected state.');
                }

                items.push(new FileTreeNode(node[0], element));
            }
            catch (e) {
                if (e.name === 'StaleElementReferenceError') {
                    // file got deleted
                    continue;
                }
                throw e;
            }
        }

        return items;
    }
}
