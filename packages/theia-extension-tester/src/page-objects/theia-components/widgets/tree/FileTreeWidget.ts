import { repeat } from 'extension-tester-page-objects';
import * as path from 'path';
import {
    FileTreeNode,
    PathUtils,
    ScrollItemNotFound,
    TheiaElement,
    TreeItemNotFound,
    TreeWidget,
    WebElement,
    Workbench
} from '../../../../module';
import { FileType } from './FileType';

export abstract class FileTreeWidget<T extends FileTreeNode> extends TreeWidget<T> {
    constructor(element: WebElement | undefined, parent?: WebElement) {
        super(element, parent);
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
                if (e.name === 'StaleElementReferenceError') {
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

        while (items.length > 0) {
            const height = await items[0].getComputedStyleNumber('height');
            const visibleHeight = (await items[0].getSize()).height;

            // if at least 55% percent of element is visible
            if (height * 0.55 < visibleHeight) {
                break;
            }

            items.shift();
        }

        while (items.length > 0) {
            const height = await items[items.length - 1].getComputedStyleNumber('height');
            const visibleHeight = (await items[items.length - 1].getSize()).height;

            // if at least 55% percent of element is visible
            if (height * 0.55 < visibleHeight) {
                break;
            }

            items.pop();
        }

        return items;
    }

    private fileComparator(root: string, segments: string[], currentPath: string[], index: number, type: FileType) {
        return async (item: T) => {
            const itemPath = PathUtils.getRelativePath(await item.getPath(), root);
            const isFile = await item.isFile();
            const currentFileType = index === segments.length ? type : FileType.FOLDER;

            // reverse logic in list
            const result = PathUtils.comparePaths(
                currentPath,
                PathUtils.convertToTreePath(itemPath),
                currentFileType === FileType.FILE,
                isFile
            );

            return result;
        }
    }

    async findFile(filePath: string | string[], type: FileType, timeout: number = 0): Promise<T> {
        if (typeof filePath === 'string' && path.isAbsolute(filePath)) {
            throw new Error('Absolute paths are not supported.');
        }

        let segments: string[] = [];

        if (typeof filePath === 'string') {
            segments = PathUtils.convertToTreePath(filePath);
        }
        else {
            segments = filePath;
        }

        async function loop(this: FileTreeWidget<T>): Promise<T> {
            const root = await new Workbench().getOpenFolderPath();
            for (let index = 1; index <= segments.length; index++) {
                const currentPath = segments.slice(0, index);
                try {
                    const item = await this.findItemWithComparator(
                        this.fileComparator(root, segments, currentPath, index, type),
                        timeout
                    );

                    if (index === segments.length) {
                        return item;
                    }
                    else if (await item.isExpandable()) {
                        await item.expand();
                    }
                    else {
                        throw new TreeItemNotFound(segments, `Remaining path ${segments.slice(index).join('/')} does not exist.`);
                    }
                }
                catch (e) {
                    if (e instanceof ScrollItemNotFound || e instanceof TreeItemNotFound) {
                        if (timeout === 0) {
                            if (e instanceof ScrollItemNotFound) {
                                throw new TreeItemNotFound(segments, e.message);
                            }
                            else {
                                throw e;
                            }
                        }
                        index--;
                        continue;
                    }
                    throw e;
                }
            }
            throw new TreeItemNotFound(segments);
        }

        return await repeat(loop.bind(this), { timeout });
    }
}
