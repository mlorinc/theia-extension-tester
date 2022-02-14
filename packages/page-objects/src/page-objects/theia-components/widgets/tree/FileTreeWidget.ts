import { PathUtils } from '@theia-extension-tester/path-utils';
import { repeat } from '@theia-extension-tester/repeat';
import {
    FileTreeNode,
    FileType,
    ScrollItemNotFound,
    TheiaElement,
    TreeItemNotFound,
    TreeWidget,
    WebElement,
} from '../../../../module';
import { error } from 'extension-tester-page-objects';

export abstract class FileTreeWidget<T extends FileTreeNode> extends TreeWidget<T> {
    private seenExpandedFolder: boolean;
    private searchLock: boolean;

    constructor(element: WebElement | undefined, parent: WebElement) {
        super(element, parent);
        this.seenExpandedFolder = false;
        this.searchLock = false;
        this.fileComparator = this.fileComparator.bind(this);
    }

    protected abstract mapTreeNode(node: TheiaElement, parent: TheiaElement): Promise<T>;

    public async getItems(): Promise<T[]> {
        const elements = await this.findElements(FileTreeWidget.locators.widgets.tree.nodeWrapper) as TheiaElement[];
        const items: T[] = [];

        for (const element of elements) {
            try {
                const node = await element.findElements(FileTreeWidget.locators.widgets.tree.node) as TheiaElement[];

                if (node.length === 0) {
                    continue;
                }

                if (node.length > 1) {
                    throw new TreeItemNotFound([], 'Tree node wrapper has more child nodes than expected. Unexpected state.');
                }

                items.push(await this.mapTreeNode(node[0], element));
            }
            catch (e) {
                if (e instanceof error.StaleElementReferenceError) {
                    // file got deleted
                    continue;
                }
                throw e;
            }
        }

        return items;
    }

    async getVisibleItems(): Promise<T[]> {
        const items = await super.getVisibleItems();
        let backwards = false;
        
        while (items.length > 0) {
            try {
                const item = items[(backwards) ? (items.length - 1) : (0)];
                const height = await item.getComputedStyleNumber('height');
                const visibleHeight = (await item.getSize()).height;

                // if at least 55% percent of element is visible
                if (height * 0.55 < visibleHeight) {
                    if (backwards) {
                        break;
                    }
                    else {
                        backwards = true;
                    }
                }
                else {
                    if (backwards) {
                        items.pop()
                    }
                    else {
                        items.shift();
                    }
                }
            }
            catch (e) {
                // ignore removed files
                if (e instanceof error.StaleElementReferenceError) {
                    continue;
                }
                throw e;
            }
        }

        return items;
    }

    private fileComparator(currentPath: string[], type: FileType) {
        return async (item: T) => {
            let itemPath: string = await item.getPath();
            const itemPathSegments = PathUtils.convertToTreePath(itemPath);

            if (PathUtils.isRelativeTo(itemPathSegments, currentPath)) {
                this.seenExpandedFolder = true;
            }

            const isFile = await item.isFile();

            // reverse logic in list
            const result = PathUtils.comparePaths(
                currentPath,
                itemPathSegments,
                type === FileType.FILE,
                isFile
            );

            return result;
        }
    }

    private getSearchFileType(targetType: FileType, pathLength: number, currentPathLength: number): FileType {
        return (currentPathLength === pathLength) ? (targetType) : (FileType.FOLDER)
    }

    private transformScrollItemError(e: Error, targetPathSegments: string[]): Error {
        if (e instanceof ScrollItemNotFound) {
            return new TreeItemNotFound(targetPathSegments, e.message);
        }
        return e;
    }

    async findFile(filePath: string | string[], type: FileType, timeout: number = 0): Promise<T> {
        if (this.searchLock) {
            throw new Error('This method cannot be called multiple times at once.');
        }

        let targetPathSegments: string[] = [];
        if (typeof filePath === 'string') {
            targetPathSegments = PathUtils.convertToTreePath(filePath);
        }
        else {
            targetPathSegments = filePath;
        }

        if (targetPathSegments.length === 0) {
            throw new Error('Cannot pass empty path.');
        }

        this.searchLock = true;

        async function loop(this: FileTreeWidget<T>): Promise<T> {
            for (let index = 1; index <= targetPathSegments.length; index++) {
                const currentPath = targetPathSegments.slice(0, index);
                
                try {
                    const item = await this.findItemWithComparator(
                        this.fileComparator(currentPath, this.getSearchFileType(type, targetPathSegments.length, currentPath.length)),
                        timeout
                    );

                    if (index === targetPathSegments.length) {
                        return item;
                    }
                    else if (await item.isExpandable()) {
                        await item.expand();
                    }
                    else {
                        throw new TreeItemNotFound(targetPathSegments, `Remaining path ${targetPathSegments.slice(index).join('/')} does not exist.`);
                    }
                }
                catch (e) {
                    if (e instanceof ScrollItemNotFound || e instanceof TreeItemNotFound) {
                        if (this.seenExpandedFolder) {
                            continue;
                        }

                        if (timeout === 0) {
                            throw this.transformScrollItemError(e, targetPathSegments);
                        }
                        index = Math.max(1, index - 1);
                        continue;
                    }
                    throw e;
                }
                finally {
                    this.seenExpandedFolder = false;
                }
            }
            throw new TreeItemNotFound(targetPathSegments);
        }

        try {
            return await repeat(loop.bind(this), { timeout });
        }
        finally {
            this.searchLock = false;
        }
    }
}