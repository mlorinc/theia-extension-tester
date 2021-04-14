import {
    getTimeout,
    ScrollableWidget,
    ScrollDirection,
    ScrollWidget,
    TreeItemNotFound,
    TreeNode,
    until,
    VerticalScrollWidget,
    WebElement
} from '../../../../module';

export abstract class TreeWidget<T extends TreeNode> extends ScrollableWidget<T> {
    private verticalScroll: ScrollWidget;

    constructor(element: WebElement | undefined, parent?: WebElement) {
        super(element || TreeWidget.locators.widgets.tree.constructor, parent);
        this.verticalScroll = new VerticalScrollWidget(this.findElement(TreeWidget.locators.widgets.tree.yScroll), this);
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
        }, getTimeout(), 'Could not find active item.') as T;
    }

    protected async getVerticalScroll(): Promise<ScrollWidget> {
        return this.verticalScroll;
    }
    protected getHorizontalScroll(): Promise<ScrollWidget> {
        throw new Error("Method not implemented.");
    }
    protected async hasVerticalScroll(): Promise<boolean> {
        await this.getDriver().actions().mouseMove(this.verticalScroll).perform();
        return this.verticalScroll.isDisplayed();
    }
    protected async hasHorizontalScroll(): Promise<boolean> {
        return false;
    }

    async findNode(options: FindNodeOptions<T>): Promise<T> {
        if (options.reset) {
            if (options.startNode) {
                throw new Error('Cannot combine reset and startNode arguments.');
            }
            await this.resetScroll();
        }

        let maxDepth = 0;
        let minDepth = 0;
        const root = options.startNode;
        const label = options.label;
        const timeout = getTimeout(options.timeout);
        const direction = options.direction;
        const earlyStopping = options.earlyStopping;

        let items: T[];

        if (root) {
            const rootDepth = await root.getTreeDepth();

            await this.getDriver().wait(until.elementIsEnabled(this), timeout);

            if (await root.isExpandable()) {
                await root.expand();
                await this.getDriver().wait(until.elementIsEnabled(this), timeout);
            }

            items = await this.getVisibleItems();
            maxDepth = rootDepth + 1;
            minDepth = rootDepth + 1;

            const { index } = await this.findOffset(root, items);

            if (index === -1) {
                throw new Error('Root node is not visible.');
            }

            if (direction === ScrollDirection.NEXT) {
                if (index + 1 === items.length) {
                    items = [];
                }
                else {
                    items = items.slice(index + 1);
                }
            }
            else if (direction === ScrollDirection.PREVIOUS) {
                items = items.slice(0, index);
            }
        }
        else {
            items = await this.getVisibleItems();
        }

        let lastActiveItem: T | undefined;

        if (items.length === 0) {
            lastActiveItem = root;
        }

        return await this.getDriver().wait(async () => {
            for (const item of items) {
                const depth = await item.getTreeDepth();
                const itemLabel = await item.getLabel();

                if (depth < minDepth) {
                    if (earlyStopping && await earlyStopping(depth, itemLabel)) {
                        throw new TreeItemNotFound([label], `Could not find node with label "${label}". Early stopped by function.`);
                    }
                    continue;
                }
                if (depth > maxDepth) {
                    continue;
                }

                if (itemLabel === label) {
                    return item;
                }
            }

            if (await this.hasAnotherPage(direction)) {
                if (lastActiveItem) {
                    items = await this.movePage(direction, lastActiveItem, timeout);
                    lastActiveItem = undefined;
                }
                else {
                    lastActiveItem = direction === ScrollDirection.NEXT ? items[items.length - 1] : items[0];
                    items = await this.movePage(direction, lastActiveItem, timeout);
                    lastActiveItem = undefined;
                }
            }
            else {
                throw new TreeItemNotFound([label], `Could not find node with label "${label}". No more pages available.`);
            }
        }, undefined, `Could not find node with label "${label}".`) as T;
    }

    async findNodeByPath(options: FindNodeByPathOptions): Promise<T> {
        const items = await this.getVisibleItems();
        const path = options.path;
        let direction = options.direction;
        const timeout = getTimeout(options.timeout);
        const strict = options.strict;

        if (path.length === 0) {
            throw new Error('Path cannot be empty.');
        }

        if (items.length === 0) {
            // tree is empty
            throw new TreeItemNotFound(path, 'Tree is empty.');
        }

        let node: T | undefined = undefined;

        console.log(`Chose ${direction === ScrollDirection.NEXT ? 'next' : 'previous'} direction.`);

        let count = 0;
        for (const segment of path) {
            await this.getDriver().wait(until.elementIsEnabled(this), timeout);

            node = await this.findNode({
                direction,
                label: segment,
                reset: node === undefined,
                startNode: node,
                timeout,
                earlyStopping: (depth, label) => true
            });


            count += 1;

            direction = ScrollDirection.NEXT;

            if (count === path.length) {
                return node;
            }

            if (await node.isExpandable() === false) {
                if (strict) {
                    throw new TreeItemNotFound(path, 'Strict search was used.');
                }

                return node;
            }
        }

        throw new TreeItemNotFound(path);
    }
}

export interface FindNodeOptions<T extends TreeNode> {
    direction: ScrollDirection;
    earlyStopping?: (depth: number, label: string) => PromiseLike<boolean> | boolean;
    label: string;
    reset?: boolean;
    startNode?: T;
    timeout?: number;
}

export interface FindNodeByPathOptions {
    direction: ScrollDirection;
    path: string[];
    strict?: boolean;
    timeout?: number;
}
