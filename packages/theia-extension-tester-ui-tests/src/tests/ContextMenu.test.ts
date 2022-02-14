import { expect } from "chai";
import { ContextMenu, EditorView, IDefaultTreeSection, IMenu, Key, TextEditor, TitleBar } from "@theia-extension-tester/page-objects";
import { deleteFiles, getExplorerSection } from "./utils/File";
import * as path from "path";

const FILE = 'quarkus-quickstarts/Alternative.txt';

describe('ContextMenu', function () {
    this.timeout(40000);
    let menu: IMenu | undefined;
    let editor: TextEditor;
    let tree: IDefaultTreeSection;

    before(async function () {
        await deleteFiles(FILE);

        tree = await getExplorerSection();
        editor = await tree.createFile(FILE) as TextEditor;
        expect(await editor.getTitle()).equals(path.basename(FILE));
        await editor.setTextAtLine(1, 'Hello world');
        await editor.sendKeys(Key.ENTER)
        await editor.sendKeys('Hello world 2');
        await editor.sendKeys(Key.ENTER);
    });

    afterEach(async function () {
        if (menu instanceof ContextMenu) {
            await menu.close();
        }
    });

    after(async function () {
        await editor.save();
        await new EditorView().closeAllEditors();
        await deleteFiles(FILE);
    });

    it('getItem', async function () {
        menu = await editor.openContextMenu() as ContextMenu;
        expect(menu).not.to.be.undefined;
        await menu!.getItem('Peek');
    });

    it('getLabel', async function () {
        menu = await editor.openContextMenu() as ContextMenu;
        expect(menu).not.to.be.undefined;
        const peek = await menu!.getItem('Refactor...');
        expect(await peek!.getLabel()).equals('Refactor...');
    });

    it('getItems', async function () {
        menu = await editor.openContextMenu() as ContextMenu;
        expect(menu).not.to.be.undefined;
        await menu!.getItem('Peek');
        const items = await menu!.getItems();
        const labels = await Promise.all(items.map((item) => item.getLabel()));

        // check some items
        expect(labels).to.include.members(['Peek', 'Refactor...', 'Redo', 'Undo', 'Copy']);
    });

    it('hasItem', async function () {
        menu = await editor.openContextMenu() as ContextMenu;
        expect(menu).not.to.be.undefined;
        await menu!.getItem('Peek');
        expect(await menu!.hasItem('Peek')).to.be.true;
        expect(await menu!.hasItem('tester')).to.be.false;
    });

    it('select', async function () {
        menu = new TitleBar();
        const subMenu = await menu.select('File') as IMenu;
        const items = await subMenu.getItems();
        const labels = await Promise.all(items.map((item) => item.getLabel()));

        expect(labels).to.include.members([
            'Settings',
            'Save',
            'Save All',
            'Open...',
            'New Folder'
        ]);

        try {
            const item = await subMenu.select('Settings', 'Open Preferences');
            expect(item).to.be.undefined;

            const tab = await new EditorView().getTabByTitle('Preferences');
            await tab.close();
        }
        finally {
            // select closes menu
            menu = undefined;
        }
    });

    it('close', async function () {
        const menu = await editor.openContextMenu();
        expect(menu).not.to.be.undefined;
        await menu.close();
        expect(await menu.isDisplayed().catch(() => false)).to.be.false;
    });
})
