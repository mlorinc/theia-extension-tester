import { DefaultTreeItem, FileTreeWidget, TheiaElement } from "../../../module";

export class DialogTree extends FileTreeWidget<DefaultTreeItem> {
    constructor(dialogContent: TheiaElement) {
        super(undefined, dialogContent, '/');
    }

    protected async mapTreeNode(node: TheiaElement, parent: TheiaElement): Promise<DefaultTreeItem> {
        return new DefaultTreeItem(node, parent);
    }
}
