import { expect } from "chai";
import { EditorView, IContentAssist, IContentAssistItem, IDefaultTreeSection, TextEditor } from "@theia-extension-tester/page-objects";
import { getExplorerSection, deleteFiles } from "./utils/File";

describe('ContentAssist', function () {
    this.timeout(40000);
    let editorView: EditorView;
    let tree: IDefaultTreeSection;
    let editor: TextEditor;
    let menu: IContentAssist | undefined;
    const file = "Editor.ts";
    const validationItems = ['#endregion', '#region', 'for', 'forin', 'forof', 'ctor', 'function', 'get'];

    before(async function () {
        editorView = new EditorView();
        tree = await getExplorerSection();
        await editorView.closeAllEditors();
        await deleteFiles(file);
        editor = await tree.createFile(file) as TextEditor;
    });

    beforeEach(async function () {
        await editor.clearText();
        menu = await editor.toggleContentAssist(true) as IContentAssist;

        expect(menu).not.to.be.undefined;
        expect(validationItems).not.to.be.empty;
        expect(editor).not.to.be.undefined;
        expect(tree).not.to.be.undefined;
        expect(editorView).not.to.be.undefined;
    });

    afterEach(async function () {
        await menu?.close();
        menu = undefined;
    });

    after(async function () {
        await deleteFiles(file);
        await menu?.close();
    });

    it('getItem', async function () {
        await editor.setText('f');
        const item = await menu!.getItem('forof');
        expect(await item.isDisplayed()).to.be.true;
        expect(await item.getLabel()).equals('forof');
    });

    it('getItem - scroll', async function () {
        await editor.setText('t');
        const item = await menu!.getItem('throw');
        expect(await item.isDisplayed()).to.be.true;
        expect(await item.getLabel()).equals('throw');
    });

    it('getItems', async function () {
        const items = await menu!.getItems();
        const titles = await Promise.all(items.map((item) => item.getLabel()));
        expect(titles).not.to.be.empty;
    });

    it('isLoaded', async function () {
        expect(await menu!.isLoaded()).to.be.true;
    });

    for (const item of validationItems) {
        it(`hasItem("${item}")`, async function () {
            await editor.setText(item[0]);
            menu = await editor.toggleContentAssist(true) as IContentAssist;
            expect(await menu!.hasItem(item)).to.be.true;
        });
    }

    it('select', async function () {
        await editor.setText('c');
        await menu?.select('class');
        const firstLine = await editor.getTextAtLine(1);
        try {
            expect(firstLine).contains('class name {');
        }
        catch {
            expect(firstLine).contains('class');
        }
    });

    it('close', async function () {
        expect(await menu?.isDisplayed()).to.be.true;
        expect(await menu?.isEnabled()).to.be.true;
        await menu?.close();

        try {
            await menu?.isDisplayed();
            expect.fail('This code should not be reached.');
        }
        catch {
            // do nothing, expected
        }
    });

    describe('ContentAssistItem', async function () {
        let item: IContentAssistItem;
        beforeEach(async function () {
            await editor.setText('f');
            item = await menu!.getItem('forof');
        });

        it('select', async function () {
            await item.select();
            const line = await editor.getTextAtLine(1);
            expect(line).contains('for (const iterator of object)');
        });

        it('getParent', async function () {
            expect(item.getParent()).equals(menu);
        });

        it('getLabel', async function () {
            expect(await item.getLabel()).equals('forof');
        });

        it('isNesting', async function () {
            expect(await item.isNesting()).to.be.false;
        });
    });
});
