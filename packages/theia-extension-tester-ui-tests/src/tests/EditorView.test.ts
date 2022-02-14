import { expect } from "chai";
import { EditorView, IDefaultTreeSection } from "@theia-extension-tester/page-objects";
import { deleteFiles, getExplorerSection } from "./utils/File";
import * as path from "path";

const MAIN_FILE = 'quarkus-quickstarts/Untitled.txt';
const ALTERNATIVE_FILE = 'quarkus-quickstarts/Alternative.txt';

const MAIN_FILE_TITLE = path.basename(MAIN_FILE);
const ALTERNATIVE_FILE_TITLE = path.basename(ALTERNATIVE_FILE);

describe('EditorView', function() {
    this.timeout(40000);
    let editorView: EditorView;
    let tree: IDefaultTreeSection;

    before(async function() {
        editorView = new EditorView();
        await editorView.closeAllEditors();
        tree = await getExplorerSection();
        await deleteFiles(MAIN_FILE, ALTERNATIVE_FILE);
        await tree.createFile(MAIN_FILE);
        await tree.createFile(ALTERNATIVE_FILE);
    });

    beforeEach(async function() {
        tree = await getExplorerSection();
        await editorView.closeAllEditors();
    });

    after(async function () {
        await deleteFiles(MAIN_FILE, ALTERNATIVE_FILE);
        await editorView.closeAllEditors();
    });

    it('openEditor', async function() {
        await tree.openFile(MAIN_FILE);
        await tree.openFile(ALTERNATIVE_FILE);

        let active = await editorView.getActiveTab();
        expect(await active.getTitle()).equals(ALTERNATIVE_FILE_TITLE);

        await openEditor(MAIN_FILE_TITLE, editorView);
        active = await editorView.getActiveTab();
        expect(await active.getTitle()).equals(MAIN_FILE_TITLE);
    });

    it('closeEditor', async function() {
        await tree.openFile(MAIN_FILE);
        const active = await editorView.getActiveTab();
        expect(await active.getTitle()).equals(MAIN_FILE_TITLE);
        await closeEditor(MAIN_FILE_TITLE, editorView);
        expect(await editorView.getOpenEditorTitles()).not.to.include(MAIN_FILE_TITLE);
    });

    it('closeAllEditors', async function() {
        expect(await editorView.getOpenTabs()).to.be.empty;
        await tree.openFile(MAIN_FILE);
        await tree.openFile(ALTERNATIVE_FILE);
        expect(await editorView.getOpenTabs()).length(2);
        await editorView.closeAllEditors();
        expect(await editorView.getOpenTabs()).to.be.empty;
    });

    it('getOpenEditorTitles', async function() {
        await tree.openFile(MAIN_FILE);
        await tree.openFile(ALTERNATIVE_FILE);
        expect(await editorView.getOpenEditorTitles()).to.include.members([MAIN_FILE_TITLE, ALTERNATIVE_FILE_TITLE]);
    });

    it('getTabByTitle', async function() {
        await tree.openFile(MAIN_FILE);
        await tree.openFile(ALTERNATIVE_FILE);
        expect(await editorView.getOpenEditorTitles()).to.include.members([MAIN_FILE_TITLE, ALTERNATIVE_FILE_TITLE]);
        const tab = await editorView.getTabByTitle(MAIN_FILE_TITLE);
        expect(await tab.getTitle()).equals(MAIN_FILE_TITLE);
    });

    it('getOpenTabs', async function() {
        await tree.openFile(MAIN_FILE);
        await tree.openFile(ALTERNATIVE_FILE);
        expect(await editorView.getOpenEditorTitles()).to.include.members([MAIN_FILE_TITLE, ALTERNATIVE_FILE_TITLE]);
        const tabs = await editorView.getOpenTabs();
        const titles = await Promise.all(tabs.map((tab) => tab.getTitle()));
        expect(titles).to.include.members([MAIN_FILE_TITLE, ALTERNATIVE_FILE_TITLE]);
    });

    it('getActiveTab', async function() {
        await tree.openFile(MAIN_FILE);
        await tree.openFile(ALTERNATIVE_FILE);
        expect(await editorView.getOpenEditorTitles()).to.include.members([MAIN_FILE_TITLE, ALTERNATIVE_FILE_TITLE]);
        const active = await editorView.getActiveTab();
        expect(await active.getTitle()).equals(ALTERNATIVE_FILE_TITLE);
    });

    it.skip('getEditorGroups', async function() {

    });

    it.skip('getEditorGroup', async function() {

    });
});

async function openEditor(file: string, editorView: EditorView) {
    await editorView.openEditor(path.basename(file));
}

async function closeEditor(file: string, editorView: EditorView) {
    await editorView.closeEditor(path.basename(file));
}