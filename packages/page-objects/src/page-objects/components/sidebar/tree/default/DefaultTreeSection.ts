import * as path from 'path';
import {
    Button,
    ContextMenu,
    DefaultTreeItem,
    EditorView,
    FileTreeWidget,
    FileType,
    IContextMenu,
    IDefaultTreeItem,
    IDefaultTreeSection,
    IEditor,
    IElementWithContextMenu,
    ILocation,
    IMenu,
    InputWidget,
    ModalDialog,
    TextEditor,
    TheiaElement,
    TreeItemNotFound,
    until,
    ViewContent,
    ViewSection,
    WebElement
} from '../../../../../module';
import { ExtestUntil } from '@theia-extension-tester/until';
import { PathUtils } from '@theia-extension-tester/path-utils';
import { LoopStatus, repeat } from '@theia-extension-tester/repeat';
import { TimeoutError, TimeoutPromise } from '@theia-extension-tester/timeout-promise';
import { error } from 'extension-tester-page-objects';

export class DefaultTreeSection extends ViewSection implements IDefaultTreeSection, IElementWithContextMenu {
    private tree: DefaultTree;
    private cache: Map<string, DefaultTreeItem>;

    constructor(element: WebElement, parent: ViewContent) {
        super(element, parent);
        this.tree = new DefaultTree(this);
        this.cache = new Map();
    }

    async openContextMenu(): Promise<IContextMenu> {
        await this.safeClick(Button.RIGHT);
        return new ContextMenu();
    }

    async getVisibleItems(): Promise<IDefaultTreeItem[]> {
        return await this.tree.getVisibleItems();
    }

    async openItem(...path: string[]): Promise<IDefaultTreeItem[]> {
        const item = await this.findItemSafe(path, FileType.FILE, this.timeoutManager().findElementTimeout());
        await item.select();
        return [];
    }

    protected async hasProgress(): Promise<boolean> {
        const content = await this.enclosingItem;
        if (content instanceof ViewContent) {
            return await content.hasProgress();
        }

        throw new Error('Enclosing item must be ViewContent.');
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

        const node = await this.tree.findItemByPath(path);

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

        const item = await this.createFileObject(filePath, FileType.FILE, timeout) as DefaultTreeItem;
        return await this.getEditor(await item.getPath(), timeout);
    }

    async createFolder(folderPath: string, timeout?: number): Promise<void> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }
        await this.createFileObject(folderPath, FileType.FOLDER, timeout);
    }

    async delete(filePath: string, type: FileType, timeout?: number): Promise<void> {
        let item = await this.findItemSafe(filePath, type, timeout);
        let menu: ContextMenu | undefined;

        await repeat(async () => {
            try {
                menu = await this.toggleFileContextMenu(item, this.timeoutManager().defaultTimeout(timeout)) as ContextMenu;
                await menu.select('Delete');
                await this.handleDialog();
                return {
                    loopStatus: LoopStatus.LOOP_UNDONE
                }
            }
            catch (e) {
                if (e instanceof error.StaleElementReferenceError) {
                    try {
                        item = await this.findItemSafe(filePath, type, 0);
                        return {
                            loopStatus: LoopStatus.LOOP_UNDONE
                        }
                    }
                    catch (findError) {
                        if (findError instanceof TreeItemNotFound) {
                            return true;
                        }
                        throw findError;
                    }
                }
                throw e;
            }
            finally {
                if (await menu?.isDisplayed().catch(() => false)) {
                    await menu?.close();
                }
            }
        },
            {
                timeout: this.timeoutManager().findElementTimeout(timeout),
                message: `Could not delete "${filePath}".`
            });
    }

    async deleteFile(filePath: string, timeout?: number): Promise<void> {
        return this.delete(filePath, FileType.FILE, timeout);
    }

    async deleteFolder(folderPath: string, timeout?: number): Promise<void> {
        return this.delete(folderPath, FileType.FOLDER, timeout);
    }

    async openFile(filePath: string, timeout?: number): Promise<IEditor> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }

        const item = await this.findItemSafe(filePath, FileType.FILE, timeout);
        await item.safeDoubleClick();
        return await this.getEditor(await item.getPath(), timeout);
    }

    async existsFile(filePath: string, timeout?: number): Promise<boolean> {
        return await this.exists(filePath, FileType.FILE, timeout);
    }

    async existsFolder(folderPath: string, timeout?: number): Promise<boolean> {
        return await this.exists(folderPath, FileType.FOLDER, timeout);
    }

    private mapFileToAction(type: FileType): string {
        return type === FileType.FILE ? 'New File' : 'New Folder';
    }

    private async toggleFileContextMenu(element: IDefaultTreeItem, timeout: number): Promise<IMenu> {
        return await element.openContextMenu();
    }

    private async toggleSectionContextMenu(timeout?: number): Promise<IMenu> {
        await this.wait();
        const element = this;
        const location: ILocation = {
            x: 5,
            y: (await this.getSize()).height - 10
        };

        await this.getDriver()
            .actions()
            .mouseMove(element, location)
            .click(Button.RIGHT)
            .perform();

        return new ContextMenu();
    }

    private async handleDialog(text?: string): Promise<void> {
        const dialog = new ModalDialog();

        if (text !== undefined) {
            const input = new InputWidget({
                parent: await dialog.getContent()
            });
            await input.setText(text);
        }

        await dialog.confirm();
    }

    private async createFileObject(filePath: string, type: FileType, timeout: number = 15000): Promise<IDefaultTreeItem> {
        await this.waitTreeLoaded(timeout);
        await this.getDriver().actions().mouseMove(this).perform();

        const segments = PathUtils.convertToTreePath(filePath);
        const action = this.mapFileToAction(type);

        if (segments.length === 0) {
            throw new Error(`Path is empty - "${filePath}"`);
        }

        let toggleElement: DefaultTreeItem | DefaultTreeSection;

        if (segments.length === 1) {
            toggleElement = this;
        }
        else {
            toggleElement = await this.findItemSafe(segments.slice(0, -1), type, timeout) as DefaultTreeItem;
        }

        let menu: IMenu;

        if (toggleElement === this) {
            menu = await this.toggleSectionContextMenu(timeout);
        }
        else if (toggleElement instanceof DefaultTreeItem) {
            await toggleElement.expand();
            menu = await this.toggleFileContextMenu(toggleElement, timeout);
        }
        else {
            throw new Error('Unexpected state.');
        }

        await TimeoutPromise.createFrom(menu.isDisplayed() as Promise<boolean>, this.timeoutManager().findElementTimeout(timeout), {
            message: `Could not load context menu when creating new ${type === FileType.FILE ? 'file' : 'folder'}.`
        });

        await menu.select(action);
        await this.handleDialog(segments[segments.length - 1]);

        const newFile = await this.findItemSafe(filePath, type, timeout);

        if (type === FileType.FOLDER) {
            await this.getDriver().wait(until.elementIsEnabled(newFile), timeout);
            await this.getDriver().wait(() => newFile.isExpanded(), timeout);
        }

        return newFile;
    }

    private async getEditor(filePath: string, timeout?: number): Promise<IEditor> {
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
                return {
                    loopStatus: LoopStatus.LOOP_DONE
                };
            }

            return {
                loopStatus: LoopStatus.LOOP_DONE
            };
        }, {
            timeout: this.timeoutManager().findElementTimeout(timeout),
            message: `Could not get open editor for "${filePath}".`
        }) as IEditor;
    }

    private async exists(filePath: string, type: FileType, timeout: number = 15000): Promise<boolean> {
        const segments = PathUtils.convertToTreePath(filePath);

        try {
            await this.findItemSafe(segments, type, timeout);
            return true;
        }
        catch (e) {
            if (e instanceof TreeItemNotFound || e instanceof TimeoutError) {
                return false;
            }
            throw e;
        }
    }

    private async findItemSafe(filePath: string | string[], type: FileType, timeout?: number): Promise<DefaultTreeItem> {
        if ((typeof filePath === 'string' && filePath.trim().length === 0) || filePath.length === 0) {
            throw new Error(`Path is empty: "${filePath}".`);
        }
        timeout = this.timeoutManager().findElementTimeout(timeout);

        await this.waitTreeLoaded(Math.max(timeout, 30000));
        
        const segments = typeof filePath === 'object' ? filePath : PathUtils.convertToTreePath(filePath);

        
        let finalPath: string[] | undefined;

        const item = await repeat(async () => {
            try {
                if (segments[0] === '/') {
                    const absolutePath = typeof filePath === 'string' ? filePath : `/${segments.join('/')}`;

                    return {
                        value: await this.getCachedFile(absolutePath) ?? await this.tree.findFile(segments, type, timeout),
                        loopStatus: LoopStatus.LOOP_DONE
                    };
                }
                else if (finalPath === undefined) {
                    const root = await this.tree.findRootItem(segments[0], timeout);

                    if (segments.length === 1) {
                        return root;
                    }

                    const rootPathString = await root.getPath();
                    finalPath = PathUtils.convertToTreePath(rootPathString).slice(0, -1).concat(segments);
                    return {
                        loopStatus: LoopStatus.LOOP_UNDONE
                    }
                }
                else {
                    const absolutePath = `/${finalPath.join('/')}`;

                    return {
                        value: await this.getCachedFile(absolutePath) ?? await this.tree.findFile(finalPath, type, timeout),
                        loopStatus: LoopStatus.LOOP_DONE
                    };
                }
            }
            catch (e) {
                if (e instanceof error.StaleElementReferenceError) {
                    return undefined;
                }

                if (e instanceof TreeItemNotFound) {
                    return {
                        loopStatus: LoopStatus.LOOP_DONE
                    };
                }
                throw e;
            }
        }, {
            timeout,
            message: `Could not find item with path "${filePath}".`
        });

        if (item instanceof DefaultTreeItem) {
            this.cache.set(await item.getPath(), item);
            return item;
        }

        throw new Error(`Invalid type returned. Type returned: ${item?.constructor.name ?? Object.keys(item ?? {})}`);
    }

    private async getCachedFile(path: string): Promise<DefaultTreeItem | undefined> {
        const item = this.cache.get(path);

        try {
            if (item === undefined) {
                return undefined;
            }
            await item.isDisplayed();
            return item;
        }
        catch (e) {
            if (e instanceof error.StaleElementReferenceError) {
                return undefined;
            }
            throw e;
        }
    }
}

class DefaultTree extends FileTreeWidget<DefaultTreeItem> {
    constructor(parent: DefaultTreeSection) {
        super(undefined, parent);
    }

    async hasItems(): Promise<boolean> {
        return true;
    }

    protected async mapTreeNode(node: TheiaElement, parent: TheiaElement): Promise<DefaultTreeItem> {
        return new DefaultTreeItem(node, parent);
    }
}
