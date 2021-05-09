import * as path from 'path';
import {
    Button,
    ContextMenu,
    DefaultTreeItem,
    EditorView,
    ExtestUntil,
    FileTreeWidget,
    FileType,
    getTimeout,
    IDefaultTreeItem,
    IDefaultTreeSection,
    IEditor,
    IElementWithContextMenu,
    ILocation,
    IMenu,
    InputWidget,
    ModalDialog,
    PathUtils,
    repeat,
    ScrollDirection,
    TextEditor,
    TheiaElement,
    TimeoutError,
    TreeItemNotFound,
    until,
    ViewContent,
    ViewSection,
    WebElement,
    Workbench
} from '../../../../../module';

export class DefaultTreeSection extends ViewSection implements IDefaultTreeSection, IElementWithContextMenu {
    private tree: DefaultTree;

    constructor(element: WebElement, parent: ViewContent) {
        super(element, parent);
        this.tree = new DefaultTree(this, new Workbench().getOpenFolderPath());
    }

    async openContextMenu(): Promise<IMenu> {
        await this.safeClick(Button.RIGHT);
        return new ContextMenu();
    }

    async getVisibleItems(): Promise<IDefaultTreeItem[]> {
        return await this.tree.getVisibleItems();
    }

    async openItem(...path: string[]): Promise<IDefaultTreeItem[]> {
        const item = await this.findItemSafe(path, FileType.FILE, getTimeout(), false);
        await item.select();
        return [];
    }

    protected async hasProgress(): Promise<boolean> {
        const content = this.enclosingItem as ViewContent;
        return await content.hasProgress();
    }

    protected async waitTreeLoaded(timeout?: number): Promise<void> {
        if (timeout === 0) {
            if (await this.hasProgress()) {
                throw new Error('Tree is not ready. Progress bar is visible.');
            }
            return;
        }

        await this.getDriver().wait(ExtestUntil.elementInteractive(this), timeout, 'Tree is not interactable.');
        await this.getDriver().wait(
            async () => await this.hasProgress() === false, timeout, 'Tree is not ready. Progress bar is visible.'
        );
    }

    async findItemByPath(...path: string[]): Promise<IDefaultTreeItem> {
        await this.waitTreeLoaded();

        const node = await this.tree.findNodeByPath({
            direction: ScrollDirection.NEXT,
            path
        });

        return node;
    }

    protected async findItemByPathStrict(path: string[], timeout?: number): Promise<IDefaultTreeItem> {
        const node = await this.tree.findNodeByPath({
            direction: ScrollDirection.NEXT,
            strict: true,
            path,
            timeout
        });
        return node;
    }

    async findItem(label: string, maxLevel?: number): Promise<IDefaultTreeItem> {
        throw new Error('Not implemented error');
    }

    async resetScroll(): Promise<void> {
        await this.tree.resetScroll();
    }

    async createFile(filePath: string, timeout?: number): Promise<IEditor> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }

        const relativePath = await getRelativePath(filePath);
        await this.createFileObject(relativePath, FileType.FILE, timeout) as DefaultTreeItem;
        return await this.getEditor(path.join(await getOpenFolderPath(), relativePath), timeout);
    }

    async createFolder(folderPath: string, timeout?: number): Promise<void> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }
        await this.createFileObject(await getRelativePath(folderPath), FileType.FOLDER, timeout);
    }

    async delete(filePath: string, type: FileType, timeout?: number): Promise<void> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }

        if (path.isAbsolute(filePath)) {
            throw new Error(`Path must not be absolute. Got: ${filePath}`);
        }

        const item = await this.findItemSafe(filePath, type, timeout);
        const menu = await this.toggleFileContextMenu(item, getTimeout(timeout));
        await menu.select('Delete');
        await this.handleDialog();

        await repeat(
            async () => await this.exists(filePath, type, 0) === false,
            {
                timeout: getTimeout(timeout),
                message: `Could not delete "${filePath}".`
            }
        );
    }

    async deleteFile(filePath: string, timeout?: number): Promise<void> {
        return this.delete(await getRelativePath(filePath), FileType.FILE, timeout);
    }

    async deleteFolder(folderPath: string, timeout?: number): Promise<void> {
        return this.delete(await getRelativePath(folderPath), FileType.FOLDER, timeout);
    }

    async openFile(filePath: string, timeout?: number): Promise<IEditor> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }

        const relativePath = await getRelativePath(filePath);
        const item = await this.findItemSafe(relativePath, FileType.FILE, timeout);
        await item.safeClick();
        return await this.getEditor(path.join(await getOpenFolderPath(), relativePath), timeout);
    }

    async existsFile(filePath: string, timeout?: number): Promise<boolean> {
        return await this.exists(await getRelativePath(filePath), FileType.FILE, timeout);
    }

    async existsFolder(folderPath: string, timeout?: number): Promise<boolean> {
        return await this.exists(await getRelativePath(folderPath), FileType.FOLDER, timeout);
    }

    private mapFileToAction(type: FileType): string {
        return type === FileType.FILE ? 'New File' : 'New Folder';
    }

    private async toggleFileContextMenu(element: IDefaultTreeItem, timeout: number): Promise<IMenu> {
        return await element.openContextMenu();
    }

    private async toggleSectionContextMenu(): Promise<IMenu> {
        const items = await this.getVisibleItems();

        let location: ILocation | undefined;
        let element: WebElement;

        if (items.length > 0) {
            const size = await items[items.length - 1].getSize();
            location = {
                x: Math.floor(size.width / 2),
                y: size.height + 5
            };
            element = items[items.length - 1];
        }
        else {
            location = undefined;
            element = this;
        }

        await this.getDriver()
            .actions()
            .mouseMove(element, location)
            .click(Button.RIGHT)
            .perform();

        return new ContextMenu();
    }

    private async handleDialog(text?: string): Promise<void> {
        const dialog = new ModalDialog();
        await dialog.isDisplayed();

        if (text !== undefined) {
            const input = new InputWidget({
                parent: await dialog.getContent()
            });
            await input.setText(text);
        }

        await dialog.confirm();
    }

    private async createFileObject(filePath: string, type: FileType, timeout: number = 15000): Promise<IDefaultTreeItem> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }

        if (path.isAbsolute(filePath)) {
            throw new Error(`Path must not be absolute. Got: ${filePath}`);
        }

        const segments = PathUtils.convertToTreePath(filePath);

        await this.waitTreeLoaded(timeout);
        await this.getDriver().actions().mouseMove(this).perform();
        const action = this.mapFileToAction(type);

        let menu: IMenu;
        let directories: IDefaultTreeItem[] = []

        if (segments.length > 1) {
            const parent = await this.tree.findFile(segments.slice(0, -1), FileType.FOLDER, timeout);
            menu = await this.toggleFileContextMenu(parent, timeout);
            directories.push(parent);
        }
        else {
            menu = await this.toggleSectionContextMenu();
        }

        await menu.select(action);
        await this.handleDialog(segments[segments.length - 1]);

        const newFile = await this.tree.findFile(filePath, type, timeout);

        if (type === FileType.FOLDER) {
            directories.push(newFile);
        }

        for (const folder of directories) {
            await this.getDriver().wait(until.elementIsEnabled(folder), timeout);
            await this.getDriver().wait(() => folder.isExpanded(), timeout);
        }

        return newFile;
    }

    private async getEditor(filePath: string, timeout?: number): Promise<IEditor> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }

        if (!path.isAbsolute(filePath)) {
            throw new Error(`Path must be absolute. Got: ${filePath}`);
        }

        return await repeat(async () => {
            const editor = await new EditorView().getActiveEditor();

            if (editor instanceof TextEditor) {
                const editorPath = await editor.getFilePath();

                if (PathUtils.normalizePath(editorPath) === filePath) {
                    return editor;
                }
            }
            else {
                return undefined;
            }

            return undefined;
        }, {
            timeout: getTimeout(timeout),
            message: `Could not get open editor for "${filePath}".`
        }) as IEditor;
    }

    private async exists(filePath: string, type: FileType, timeout: number = 15000): Promise<boolean> {
        if (path.isAbsolute(filePath)) {
            throw new Error(`Path must not be absolute. Got: ${filePath}`);
        }

        const segments = PathUtils.convertToTreePath(filePath);

        try {
            console.log(`Calling this.tree.findFile with timeout ${timeout}.`)
            await this.tree.findFile(segments, type, timeout);
            return true;
        }
        catch (e) {
            console.log(`Error: ${e}\nTimeout: ${timeout}.`);
            if (e instanceof TreeItemNotFound || e.name === 'StaleElementReferenceError' || e instanceof TimeoutError) {
                return false;
            }
            throw e;
        }
    }

    private async findItemSafe(filePath: string | string[], type: FileType, timeout?: number, strict: boolean = true): Promise<IDefaultTreeItem> {
        timeout = getTimeout(timeout);
        await this.waitTreeLoaded(timeout);
        const segments = typeof filePath === 'object' ? filePath : PathUtils.convertToTreePath(filePath);

        const item = await repeat(async () => {
            try {
                if (strict) {
                    return await this.tree.findFile(segments, type, timeout);
                }
                else {
                    return await this.findItemByPath(...segments);
                }
            }
            catch (e) {
                if (e instanceof TreeItemNotFound || e.name === 'StaleElementReferenceError') {
                    return undefined;
                }
                throw e;
            }
        }, {
            timeout,
            message: `Could not find item with path "${filePath}".`
        });

        return item as IDefaultTreeItem;
    }
}

async function getRelativePath(filePath: string): Promise<string> {
    return PathUtils.getRelativePath(filePath, await new Workbench().getOpenFolderPath());
}

async function getOpenFolderPath(): Promise<string> {
    return await new Workbench().getOpenFolderPath();
}

class DefaultTree extends FileTreeWidget<DefaultTreeItem> {
    constructor(parent: DefaultTreeSection, root: Promise<string>) {
        super(undefined, parent, root);
    }

    protected async mapTreeNode(node: TheiaElement, parent: TheiaElement): Promise<DefaultTreeItem> {
        return new DefaultTreeItem(node, parent);
    }
}
