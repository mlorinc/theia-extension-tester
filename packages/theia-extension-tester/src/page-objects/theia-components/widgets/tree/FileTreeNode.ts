import { TheiaElement } from "../../TheiaElement";
import { TreeNode } from "./TreeNode";
import * as path from "path";

export class FileTreeNode extends TreeNode {
    constructor(element: TheiaElement, parent: TheiaElement) {
        super(element, parent);
    }

    async isExpanded(): Promise<boolean> {
        const toggle = await this.findElement(FileTreeNode.locators.widgets.tree.file.expandToggle) as TheiaElement;
        return await toggle.isCollapsed() === false;
    }

    async isEnabled(): Promise<boolean> {
        if (await this.isExpandable()) {
            const toggle = await this.findElement(FileTreeNode.locators.widgets.tree.file.expandToggle) as TheiaElement;
            return await super.isEnabled() && await toggle.isEnabled();
        }

        return await super.isEnabled();
    }

    async getPath(): Promise<string> {
        return await this.getAttribute('title');
    }

    async getLabel(): Promise<string> {
        const filePath = await this.getPath();

        if (filePath === '/') {
            return '/';
        }

        return path.basename(await this.getPath());
    }

    async isDirectory(): Promise<boolean> {
        const classes = await this.getAttribute('class')
        return classes.includes('theia-DirNode');
    }
}
