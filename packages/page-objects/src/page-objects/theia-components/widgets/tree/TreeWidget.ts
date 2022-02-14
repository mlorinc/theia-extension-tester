import { repeat } from '@theia-extension-tester/repeat';
import { error } from 'extension-tester-page-objects';
import {
    Scroll,
    ScrollableWidget,
    TreeItemNotFound,
    TreeNode,
    HTMLVerticalScroll,
    WebElement
} from '../../../../module';
import { TreeStructure } from './TreeStructure';


export abstract class TreeWidget<T extends TreeNode> extends ScrollableWidget<T> {

    constructor(element: WebElement | undefined, parent?: WebElement) {
        super(element || TreeWidget.locators.widgets.tree.constructor, parent);
        this.findItemByPathHelper = this.findItemByPathHelper.bind(this);
    }

    async length(): Promise<number> {
        return (await this.getItems()).length;
    }

    async getActiveItem(): Promise<T> {
        return await this.getDriver().wait(async () => {
            const items = await this.getItems();

            for (const item of items) {
                if (await item.isSelected()) {
                    return item;
                }
            }
            return undefined
        }, this.timeoutManager().findElementTimeout(), 'Could not find active item.') as T;
    }

    protected async getVerticalScroll(): Promise<Scroll> {
        return new HTMLVerticalScroll(this);
    }
    protected getHorizontalScroll(): Promise<Scroll> {
        throw new Error("Method not implemented.");
    }
    protected async hasVerticalScroll(): Promise<boolean> {
        try {
            const scroll = await this.getVerticalScroll();
            await this.getDriver().actions().mouseMove(scroll).perform();
            return scroll.isDisplayed();
        }
        catch {
            return false;
        }
    }
    protected async hasHorizontalScroll(): Promise<boolean> {
        return false;
    }

    async getVisibleItemsByDepth(depth: number): Promise<T[]> {
        const items = [];
        for (const item of await this.getVisibleItems()) {
            try {   
                if (await item.getTreeDepth() === depth) {
                    items.push(item)
                }
            }
            catch (e) {
                if (e instanceof error.StaleElementReferenceError) {
                    continue;
                }
            }
        }
        return items;
    }

    async findRootItem(label: string, timeout?: number): Promise<T> {
        await this.resetScroll();
        return await repeat(async () => {
            const items = await this.getVisibleItemsByDepth(0);

            for (const item of items) {
                if (await item.getLabel() === label) {
                    return item;
                }
            }

            if (await this.hasNextPage()) {
                await this.nextPage();
            }
            else {
                throw new TreeItemNotFound([label]);
            }

            return undefined;
        }, {
            timeout: this.timeoutManager().findElementTimeout(timeout),
            message: `Could not find root item with label "${label}".`
        }) as T;
    }

    private async findItemByPathHelper(itemPath: string[], tree: TreeStructure<T>, timeout?: number): Promise<T> {
        let index = 0;
        let lastAddedElement: T | undefined = undefined;
        let checkLastAddedElement = false;

        return await repeat(async () => {
            const items = await this.getVisibleItems();

            if (lastAddedElement && await lastAddedElement.isDisplayed().catch(() => false) === false) {
                lastAddedElement = undefined;
                checkLastAddedElement = false;
            }

            for (const item of items) {
                if (checkLastAddedElement && lastAddedElement) {
                    if (await item.getId() !== await lastAddedElement.getId()) {
                        continue;
                    }
                    lastAddedElement = undefined;
                }
                else {
                    await tree.add(item);
                    lastAddedElement = item;
                }
            }
            
            let lastNode: T | undefined;
            let node = tree.relativeSearch(itemPath[index]);
            while (node) {
                index += 1;
                if (index === itemPath.length) {
                    return node;
                }
                lastNode = node;
                node = tree.relativeSearch(itemPath[index]);
            }

            // it might be collapsed directory
            if (lastNode && await lastNode.isExpandable() && await lastNode.isExpanded() === false) {
                await lastNode.expand();
                checkLastAddedElement = true;
            }
            else if (await this.hasNextPage()) {
                await this.nextPage();
            }
            else {
                throw new TreeItemNotFound(itemPath);
            }

            return undefined;
        }, {
            timeout: this.timeoutManager().findElementTimeout(timeout),
            message: `Could not find item with relative path "${itemPath.join('/')}"`
        }) as T;
    }

    //@ts-ignore
    async findItemByPath(itemPath: string[], timeout?: number): Promise<T> {
        if (itemPath.length === 0) {
            throw new Error('Empty path not allowed.');
        }

        await this.resetScroll();
        return await this.findItemByPathHelper(itemPath, new TreeStructure<T>(), timeout);
    }
}
