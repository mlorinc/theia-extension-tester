import { getTimeout, IDefaultTreeItem, IDefaultTreeSection, IEditor, IMenu, PathUtils, repeat, StopRepeat, TimeoutError, TreeItemNotFound } from "extension-tester-page-objects";
import { Button, until, WebElement } from "selenium-webdriver";
import { ScrollDirection } from "../../../../theia-components/widgets/scrollable/ScrollableWidget";
import { FileTreeWidget } from "../../../../theia-components/widgets/tree/FileTreeWidget";
import { EditorView } from "../../../editor/EditorView";
import { ViewContent } from "../../ViewContent";
import { ViewSection } from "../../ViewSection";
import { DefaultTreeItem } from "./DefaultTreeItem";
import * as path from "path";
import { ModalDialog } from "../../../dialog/ModalDialog";
import { Workbench } from "../../../workbench/Workbench";
import { IElementWithContextMenu } from "extension-tester-page-objects/out/components/ElementWithContextMenu";
import { ContextMenu } from "../../../menu/ContextMenu";
import { InputWidget } from "../../../../theia-components/widgets/input/InputWidget";
import { TextEditor } from "../../../editor/TextEditor";

export class DefaultTreeSection extends ViewSection implements IDefaultTreeSection, IElementWithContextMenu {
    private tree: FileTreeWidget;

    constructor(element: WebElement, parent?: ViewContent) {
        super(element, parent);
        this.tree = new FileTreeWidget(undefined, element);
    }

    async openContextMenu(): Promise<IMenu> {
        await this.safeClick(Button.RIGHT);
        return new ContextMenu();
    }

    async getVisibleItems(): Promise<IDefaultTreeItem[]> {
        const items = await this.tree.getVisibleItems();
        return Promise.all(items.map((item) => new DefaultTreeItem(item)));
    }

    async openItem(...path: string[]): Promise<IDefaultTreeItem[]> {
        const item = await this.findItemSafe(path, getTimeout(), false);
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

        await this.getDriver().wait(
            async () => await this.hasProgress() === false, timeout, 'Tree is not ready. Progress bar is visible.'
        );
    }

    async findItemByPath(...path: string[]): Promise<IDefaultTreeItem> {
        await this.waitTreeLoaded();

        const node = await this.tree.findNodeByPath({
            direction: ScrollDirection.NEXT,
            path,
            treeReady: async () => await this.hasProgress() === false
        });

        return new DefaultTreeItem(node);
    }

    protected async findItemByPathStrict(path: string[], timeout?: number): Promise<IDefaultTreeItem> {
        const node = await this.tree.findNodeByPath({
            direction: ScrollDirection.NEXT,
            strict: true,
            path,
            timeout,
            treeReady: async () => await this.hasProgress() === false
        });
        return new DefaultTreeItem(node);
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

        filePath = await this.createFileObject(filePath, 'file', timeout);
        filePath = path.join(await getOpenFolderPath(), filePath);
        return await this.getEditor(filePath, timeout);
    }

    async createFolder(folderPath: string, timeout?: number): Promise<void> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }
        await this.createFileObject(folderPath, 'folder', timeout);
    }

    async deleteFile(filePath: string, timeout?: number): Promise<void> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }

        filePath = await getRelativePath(filePath);
        const item = await this.findItemSafe(filePath, timeout);

        await item.safeClick();
        await item.getDriver().wait(until.elementIsSelected(item), getTimeout(timeout));
        const menu = await item.openContextMenu();
        await menu.select('Delete');

        const dialog = new ModalDialog();
        await dialog.confirm();

        const absolutePath = path.join(await getOpenFolderPath(), filePath);
        await this.getDriver().wait(async () => {
            for (const item of await this.getVisibleItems() as DefaultTreeItem[]) {
                try {
                    if (await item.getPath() === absolutePath) {
                        return false;
                    }
                }
                catch (e) {
                    if (e.name !== 'StaleElementReferenceError') {
                        throw e;
                    }
                    continue;
                }
            }
            return true;
        }, getTimeout(timeout), `Could not delete "${filePath}".`);
    }

    deleteFolder(folderPath: string, timeout?: number): Promise<void> {
        return this.deleteFile(folderPath, timeout);
    }

    async openFile(filePath: string, timeout?: number): Promise<IEditor> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }

        filePath = await getRelativePath(filePath);
        const item = await this.findItemSafe(filePath, timeout);
        await item.safeClick();
        return await this.getEditor(path.join(await getOpenFolderPath(), filePath), timeout);
    }

    async existsFile(filePath: string, timeout?: number): Promise<boolean> {
        return await this.exists(filePath, (file) => file.isFile(), timeout);
    }

    async existsFolder(folderPath: string, timeout?: number): Promise<boolean> {
        return await this.exists(folderPath, (folder) => folder.isFolder(), timeout);
    }

    private async createFileObject(filePath: string, type: 'file' | 'folder', timeout: number = 5000): Promise<string> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }

        filePath = PathUtils.getRelativePath(filePath, await getOpenFolderPath());
        const segments = PathUtils.convertToTreePath(filePath);
        await this.getDriver().actions().mouseMove(this).perform();

        let action: string;

        if (type === 'file') {
            action = 'New File';
        }
        else {
            action = 'New Folder';
        }

        let menu: IMenu;
        if (segments.length > 1) {
            try {
                const parent = await this.findItemSafe(segments.slice(0, -1), timeout);
                await parent.safeClick();
                await parent.getDriver().wait(until.elementIsSelected(parent), timeout);
                menu = await parent.openContextMenu();
            }
            catch {
                throw new Error(`Could not find parent folder "${segments.slice(0, -1).join(path.sep)}" for "${segments[segments.length - 1]}".`);
            }
        }
        else {
            const items = await this.getVisibleItems();

            if (items.length > 0) {
                const height = (await items[items.length - 1].getSize()).height;
                await this.getDriver()
                    .actions()
                    .mouseMove(items[items.length - 1], { x: 0, y: height + 5 })
                    .click(Button.RIGHT)
                    .perform();
                menu = new ContextMenu();
            }
            else {
                const action = await this.getAction('More Actions...');
                await action.safeClick();
                menu = new ContextMenu();
            }
        }

        await menu.select(action);

        const dialog = new ModalDialog();
        await dialog.isDisplayed();

        const input = new InputWidget({
            parent: await dialog.getContent()
        });

        await input.setText(segments[segments.length - 1]);
        await input.confirm();

        return filePath;
    }

    private async getEditor(filePath: string, timeout?: number): Promise<IEditor> {
        if (timeout === 0) {
            throw new Error('Timeout must not be zero.');
        }

        return await this.getDriver().wait(async () => {
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
        }, getTimeout(timeout), `Could not get open editor for "${filePath}".`) as IEditor;
    }

    private async exists(filePath: string, fn: ((file: IDefaultTreeItem) => Promise<boolean>), timeout: number = 15000): Promise<boolean> {
        filePath = PathUtils.getRelativePath(filePath, await getOpenFolderPath());
        const segments = PathUtils.convertToTreePath(filePath);

        try {
            await this.findItemSafe(segments, timeout);
            return true;
        }
        catch (e) {
            console.log(e);
            if (e instanceof TimeoutError || e instanceof StopRepeat) {
                return false;
            }
            throw e;
        }
    }

    private async findItemSafe(filePath: string | string[], timeout?: number, strict: boolean = true): Promise<IDefaultTreeItem> {
        timeout = getTimeout(timeout);
        await this.waitTreeLoaded(timeout || 6000);

        const segments = typeof filePath === 'object' ? filePath : PathUtils.convertToTreePath(filePath);

        const item = await repeat(async () => {
            try {
                if (strict) {
                    return await this.findItemByPathStrict(segments, timeout);
                }
                else {
                    return await this.findItemByPath(...segments);
                }
            }
            catch (e) {
                if (e instanceof TreeItemNotFound || e.name === 'StaleElementReferenceError') {
                    return undefined;
                }
                throw new StopRepeat(e);
            }
        },
            {
                timeout,
                message: `Could not find item with path "${filePath}".`
            }
        );

        return item as IDefaultTreeItem;
    }
}

async function getRelativePath(filePath: string): Promise<string> {
    return PathUtils.getRelativePath(filePath, await new Workbench().getOpenFolderPath());
}

async function getOpenFolderPath(): Promise<string> {
    return await new Workbench().getOpenFolderPath();
}

