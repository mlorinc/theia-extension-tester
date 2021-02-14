import { IEditorView, IEditorGroup } from "extension-tester-page-objects";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { Editor } from "./Editor";
import { EditorTab } from "./EditorTab";

export class EditorView extends TheiaElement implements IEditorView {
    constructor() {
        super(TheiaElement.locators.components.editor.editorView.locator);
    }

    async openEditor(title: string, groupIndex: number = 0): Promise<Editor> {
        const tab = await this.getTabByTitle(title, groupIndex);
        await tab.select();
        await this.getDriver().wait(() => tab.isSelected());
        return new Editor(TheiaElement.locators.components.editor.editor.locator({ fileUrl: title }), this, tab);
    }

    async closeEditor(title: string, groupIndex: number = 0): Promise<void> {
        const tab = await this.getTabByTitle(title, groupIndex);
        await tab.close();
    }

    async closeAllEditors(groupIndex?: number): Promise<void> {
        const tabs = await this.getOpenTabs();
        for (const tab of tabs) {
            await tab.close();
        }
    }

    async getOpenEditorTitles(groupIndex?: number): Promise<string[]> {
        return await Promise.all((await this.getOpenTabs()).map((tab) => tab.getTitle()));
    }

    async getTabByTitle(title: string, groupIndex: number): Promise<EditorTab> {
        const element = this.findElement(TheiaElement.locators.components.editor.editorTabByLabel.locator({ title }));
        return new EditorTab(element, this);
    }

    async getOpenTabs(groupIndex: number = 0): Promise<EditorTab[]> {
        const elements = await this.findElements(TheiaElement.locators.components.editor.editorTab.locator);
        return elements.map((element) => new EditorTab(element, this));
    }

    async getActiveTab(): Promise<EditorTab> {
        for (const tab of await this.getOpenTabs()) {
            if (await tab.isSelected()) {
                return tab;
            }
        }

        throw new Error('Could find selected tab')
    }

    getEditorGroups(): Promise<IEditorGroup[]> {
        throw new Error("Method not implemented.");
    }
    getEditorGroup(index: number): Promise<IEditorGroup> {
        throw new Error("Method not implemented.");
    }
}
