import { By, Editor, EditorTab, EditorView, TextEditor, TheiaElement } from "../../../module";

export class TheiaEditorPreview extends TextEditor {
    constructor(private root: Editor, editorView: EditorView, tab: EditorTab) {
        super(new TheiaElement(root.findElement(By.className('theia-editor')), editorView), editorView, tab);
    }

    async getIdentification(): Promise<string> {
        return this.root.getAttribute('id');
    }

    async getFileUri(): Promise<string> {
        const id = await super.getIdentification();
        return super.getFileUri(id);
    }
}
