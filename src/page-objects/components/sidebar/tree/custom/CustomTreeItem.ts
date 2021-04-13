import { ICustomTreeItem, IMenu, ITreeItem, IViewItemAction } from "extension-tester-page-objects";
import { By, WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../../../theia-components/TheiaElement";
import { TreeNode } from "../../../../theia-components/widgets/tree/TreeNode";

export class CustomTreeItem extends TreeNode implements ICustomTreeItem  {
    constructor(element: TheiaElement) {
        super(element, element.getEnclosingElement() as TheiaElement);
    }

    getLabel(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    hasChildren(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    getChildren(): Promise<ITreeItem[]> {
        throw new Error("Method not implemented.");
    }
    findChildItem(name: string): Promise<ITreeItem | undefined> {
        throw new Error("Method not implemented.");
    }
    getActionButtons(): Promise<IViewItemAction[]> {
        throw new Error("Method not implemented.");
    }
    getActionButton(label: string): Promise<IViewItemAction | undefined> {
        throw new Error("Method not implemented.");
    }
    getChildItems(locator: By): Promise<WebElement[]> {
        throw new Error("Method not implemented.");
    }
    select(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    openContextMenu(): Promise<IMenu> {
        throw new Error("Method not implemented.");
    }
    isExpanded(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}
