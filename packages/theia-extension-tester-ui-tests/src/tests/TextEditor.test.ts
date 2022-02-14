import { expect } from "chai";
import { ContentAssist, ContextMenu, EditorView, IDefaultTreeSection, TextEditor } from "@theia-extension-tester/page-objects";
import { deleteFiles, getExplorerSection, getProjectPath } from "./utils/File";
import * as path from "path";
import { repeat } from "@theia-extension-tester/repeat";

const lorem =
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`


describe('TextEditor', function () {
    this.timeout(40000);
    let editorView: EditorView;
    let tree: IDefaultTreeSection;
    let editor: TextEditor;
    let menu: ContentAssist | ContextMenu | undefined;
    const FILE = "quarkus-quickstarts/Editor.ts";
    let filePath: string;

    before(async function () {
        editorView = new EditorView();
        tree = await getExplorerSection();
        await editorView.closeAllEditors();
        await deleteFiles(FILE);
        editor = await tree.createFile(FILE) as TextEditor;
        filePath = path.join(getProjectPath(), FILE);
    });

    beforeEach(async function () {
        await editor.clearText();
    });

    afterEach(async function () {
        await menu?.close();
        menu = undefined;
    });

    after(async function () {
        await editor.save();
        await deleteFiles(FILE);
        await editorView.closeAllEditors();
    });

    it('getTitle', async function () {
        expect(await editor.getTitle()).equals(path.basename(FILE));
    });

    it('getTab', async function () {
        expect(await (await editor.getTab()).getTitle()).equals(path.basename(FILE));
    });

    it('openContextMenu', async function () {
        menu = await editor.openContextMenu() as ContextMenu;
        const titles = await Promise.all((await menu.getItems()).map((item) => item.getLabel()));
        expect(titles).to.include.members(['Call Hierarchy', 'Peek', 'Change All Occurrences', 'Redo', 'Copy']);
        expect(titles).not.to.include.members(['']);
    });

    it('isDirty', async function () {
        expect(await editor.isDirty()).to.be.false;
        await editor.setTextAtLine(1, 'Hello world');
        await repeat(() => editor.isDirty(), { timeout: this.timeout() - 2000, message: 'Expected editor to be dirty.' });
    });

    it('save', async function () {
        this.timeout(100000);
        await repeat(async () => await editor.isDirty() === false, { timeout: this.timeout() - 2000, message: 'Expected editor not to be dirty. #1' });
        await editor.setTextAtLine(1, 'Hello world');
        await repeat(() => editor.isDirty(), { timeout: this.timeout() - 2000, message: 'Expected editor to be dirty.' });
        await editor.save(90000);
        await repeat(async () => await editor.isDirty() === false, { timeout: this.timeout() - 2000, message: 'Expected editor not to be dirty. #2' });
    });

    it('getFileUri', async function () {
        expect(await editor.getFileUri()).equals(`file://${filePath}`);
    });

    it('getFilePath', async function () {
        expect(await editor.getFilePath()).equals(filePath);
    });

    it('toggleContentAssist - open', async function () {
        const assist = await editor.toggleContentAssist(true) as ContentAssist;
        await assist.getDriver().wait(() => assist.isLoaded(), this.timeout() - 1000, 'Could not load assist.');
        menu = assist;
        expect(await assist.isDisplayed()).to.be.true;
        expect(await assist.isLoaded()).to.be.true;
    });

    it('toggleContentAssist - close', async function () {
        menu = await editor.toggleContentAssist(true) as ContentAssist;
        expect(await menu.isDisplayed()).to.be.true;

        await editor.toggleContentAssist(false);
        menu = new ContentAssist(undefined, editor) as ContentAssist;
        expect(await menu.isDisplayed()).to.be.false;
    });

    it('getText', async function () {
        expect(await editor.getText()).equals('\n');
        await editor.setText(lorem);
        expect(await editor.getText()).equals(lorem.trimEnd());
    });

    it('setText', async function () {
        expect(await editor.getText()).equals('\n');
        await editor.setText(lorem);
        expect(await editor.getText()).equals(lorem);

        await editor.clearText();
        await editor.setText('');
        expect(await editor.getText()).equals('\n');
    });

    it('clearText', async function () {
        expect(await editor.getText()).equals('\n');
        await editor.setText(lorem);
        expect(await editor.getText()).equals(lorem);
        await editor.clearText();
        expect(await editor.getText()).equals('\n');
    });

    it('getTextAtLine', async function () {
        expect(await editor.getText()).equals('\n');
        await editor.setText(lorem);
        expect(await editor.getText()).equals(lorem);

        const lines = lorem.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            expect(await editor.getTextAtLine(i + 1)).equals(line);
        }
    });

    it('setTextAtLine', async function () {
        expect(await editor.getText()).equals('\n');
        await editor.setText(lorem);
        expect(await editor.getText()).equals(lorem);

        await editor.setTextAtLine(2, 'Hello world');
        expect(await editor.getTextAtLine(2)).equals('Hello world');
    });

    it('typeText', async function () {
        expect(await editor.getText()).equals('\n');
        await editor.setText(lorem);
        expect(await editor.getText()).equals(lorem);

        const lines = lorem.split('\n');

        const startPhrase = 'start';
        const middlePhrase = 'middle';
        const endPhrase = 'end';

        for (let i = 0; i < lines.length; i++) {
            const editorLine = await editor.getTextAtLine(i + 1);
            const median = Math.floor(editorLine.length / 2);

            await editor.typeText(i + 1, 1, 'start');
            await editor.typeText(i + 1, median + 1, 'middle');
            await editor.typeText(i + 1, editorLine.length + startPhrase.length + middlePhrase.length + 1, 'end');

            const finalLine = await editor.getTextAtLine(i + 1);
            expect(finalLine.slice(0, startPhrase.length)).equals(startPhrase);
            expect(finalLine.substr(median, middlePhrase.length)).equals(middlePhrase);
            expect(finalLine.slice(-endPhrase.length)).equals(endPhrase);
        }
    });

    it('moveCursor', async function () {
        expect(await editor.getText()).equals('\n');
        await editor.setText(lorem);
        expect(await editor.getText()).equals(lorem);
        await editor.moveCursor(2, 5);
    });

    it('getNumberOfLines', async function () {
        expect(await editor.getText()).equals('\n');
        await editor.setText(lorem);
        expect(await editor.getText()).equals(lorem);
        expect(await editor.getNumberOfLines()).equals(lorem.split('\n').length);
    });

    it.skip('formatDocument', async function () {

    });
});
