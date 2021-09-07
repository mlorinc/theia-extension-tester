import { expect } from "chai";
import { EditorView, IDefaultTreeSection } from "@theia-extension-tester/page-objects";
import { deleteFiles, getExplorerSection } from "./utils/File";

const MAIN_FILE = 'Untitled.txt';
const ALTERNATIVE_FILE = 'Alternative.txt';

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
        expect(await active.getTitle()).equals(ALTERNATIVE_FILE);

        await editorView.openEditor(MAIN_FILE);
        active = await editorView.getActiveTab();
        expect(await active.getTitle()).equals(MAIN_FILE);
    });

    it('closeEditor', async function() {
        await tree.openFile(MAIN_FILE);
        const active = await editorView.getActiveTab();
        expect(await active.getTitle()).equals(MAIN_FILE);
        await editorView.closeEditor(MAIN_FILE);
        expect(await editorView.getOpenEditorTitles()).not.to.include(MAIN_FILE);
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
        expect(await editorView.getOpenEditorTitles()).to.include.members([MAIN_FILE, ALTERNATIVE_FILE]);
    });

    it('getTabByTitle', async function() {
        await tree.openFile(MAIN_FILE);
        await tree.openFile(ALTERNATIVE_FILE);
        expect(await editorView.getOpenEditorTitles()).to.include.members([MAIN_FILE, ALTERNATIVE_FILE]);
        const tab = await editorView.getTabByTitle(MAIN_FILE);
        expect(await tab.getTitle()).equals(MAIN_FILE);
    });

    it('getOpenTabs', async function() {
        await tree.openFile(MAIN_FILE);
        await tree.openFile(ALTERNATIVE_FILE);
        expect(await editorView.getOpenEditorTitles()).to.include.members([MAIN_FILE, ALTERNATIVE_FILE]);
        const tabs = await editorView.getOpenTabs();
        const titles = await Promise.all(tabs.map((tab) => tab.getTitle()));
        expect(titles).to.include.members([MAIN_FILE, ALTERNATIVE_FILE]);
    });

    it('getActiveTab', async function() {
        await tree.openFile(MAIN_FILE);
        await tree.openFile(ALTERNATIVE_FILE);
        expect(await editorView.getOpenEditorTitles()).to.include.members([MAIN_FILE, ALTERNATIVE_FILE]);
        const active = await editorView.getActiveTab();
        expect(await active.getTitle()).equals(ALTERNATIVE_FILE);
    });

    it.skip('getEditorGroups', async function() {

    });

    it.skip('getEditorGroup', async function() {

    });
});
