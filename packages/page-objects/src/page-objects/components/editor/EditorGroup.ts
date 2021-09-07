import {
    EditorView,
    IEditor,
    IEditorGroup,
    IEditorTab,
    TheiaElement
} from '../../../module';

export class EditorGroup extends TheiaElement implements IEditorGroup {
    private editorView: EditorView;
    private index: number;

    constructor(index: number) {
        super(new EditorView());
        this.editorView = new EditorView();
        this.index = index;
    }
    openEditor(title: string): Promise<IEditor> {
        return this.editorView.openEditor(title, this.index);
    }
    closeEditor(title: string): Promise<void> {
        return this.editorView.closeEditor(title, this.index);
    }
    closeAllEditors(): Promise<void> {
        return this.editorView.closeAllEditors(this.index);
    }
    getOpenEditorTitles(): Promise<string[]> {
        return this.editorView.getOpenEditorTitles(this.index);
    }
    getTabByTitle(title: string): Promise<IEditorTab> {
        return this.editorView.getTabByTitle(title, this.index);
    }
    getOpenTabs(): Promise<IEditorTab[]> {
        return this.editorView.getOpenTabs(this.index);
    }
    async getActiveTab(): Promise<IEditorTab | undefined> {
        for (const tab of await this.getOpenTabs()) {
            if (await tab.isSelected()) {
                return tab;
            }
        }

        throw new Error('Could find selected tab')
    }
}
