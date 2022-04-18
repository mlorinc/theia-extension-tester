import { Editor, EditorView, IDefaultTreeSection, Workbench } from "@theia-extension-tester/page-objects";
import { deleteFiles, getExplorerSection } from "./utils/File";
import * as path from "path";
import { expect } from "chai";

const root = 'EditorGroup';
const MARKDOWN = path.join(root, "README.md");
const MARKDOWN_SECONDARY = path.join(root, "Example.md");
const ALTERNATIVE_FILE = path.join(root, "Alternative.txt");

describe.skip('EditorGroup', function() {
    this.timeout(40000);
    let editorView: EditorView;
    let tree: IDefaultTreeSection;

    before(async function() {
        editorView = new EditorView();
        await editorView.closeAllEditors();
        tree = await getExplorerSection();

        await deleteFiles(root);
        await tree.createFolder(root);
        await tree.createFile(MARKDOWN);
        await tree.createFile(MARKDOWN_SECONDARY);
        await tree.createFile(ALTERNATIVE_FILE);
    });

    beforeEach(async function() {
        tree = await getExplorerSection();
        await editorView.closeAllEditors();
    });

    after(async function () {
        await editorView.closeAllEditors();
        await deleteFiles(root);
    });

    // @ts-ignore
    async function openEditors(files: string[][]) {
        for (const group of files) {
            for (const file of group) {
                await tree.openFile(file);
                await new Workbench().executeCommand('Markdown: Open Preview to the Side');
            }
        }

        await tree.openFile(MARKDOWN);
        await new Workbench().executeCommand('Markdown: Open Preview to the Side');
        const group = await editorView.getEditorGroup(1);
        await tree.openFile(ALTERNATIVE_FILE);

        let activeEditor = await editorView.getActiveEditor();

        expect(await activeEditor.getTitle()).equals(path.basename(ALTERNATIVE_FILE));
        expect(await editorView.getOpenEditorTitles(0)).to.include.members([path.basename(MARKDOWN)]);
        expect(await editorView.getOpenEditorTitles(1))
            .to.include.members([`Preview ${path.basename(MARKDOWN)}`, path.basename(ALTERNATIVE_FILE)]);
        return group;
    }

    it('openEditor', async function() {
        // const group = await openEditors();
        // const activeEditor = await group.openEditor(`Preview ${path.basename(MARKDOWN)}`) as Editor;
        // expect(await activeEditor.getTitle()).equals(`Preview ${path.basename(MARKDOWN)}`);
    });

    it('closeEditor', async function() {
        await tree.openFile(MARKDOWN);
        await new Workbench().executeCommand('Markdown: Open Preview to the Side');
        const group = await editorView.getEditorGroup(1);
        await tree.openFile(ALTERNATIVE_FILE);

        let activeEditor = await editorView.getActiveEditor();
        
        expect(await activeEditor.getTitle()).equals(path.basename(ALTERNATIVE_FILE));
        activeEditor = await group.openEditor(`Preview ${path.basename(MARKDOWN)}`) as Editor;
        expect(await activeEditor.getTitle()).equals(`Preview ${path.basename(MARKDOWN)}`);
    });

    it('closeAllEditors', async function() {

    });

    it('getOpenEditorTitles', async function() {

    });

    it('getTabByTitle', async function() {

    });

    it('getOpenTabs', async function() {

    });

    it('getActiveTab', async function() {

    });
});
