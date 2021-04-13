import { Editor } from './Editor';
import { EditorTab } from './EditorTab';
import { getTimeout, IEditor, IEditorGroup, IEditorTab, IEditorView } from 'extension-tester-page-objects';
import { TheiaElement } from '../../theia-components/TheiaElement';
import { EditorGroup } from './EditorGroup';
import { TextEditor } from './TextEditor';

export class EditorView extends TheiaElement implements IEditorView {
    constructor() {
        super(TheiaElement.locators.components.editor.view);
    }

    async getActiveEditor(): Promise<Editor> {
        return await this.getDriver().wait(async () => {
            const editorElements = await this.findElements(EditorView.locators.components.editor.constructor) as TheiaElement[];
            const editors = await Promise.all(editorElements.map(async (element) => {
                return new Editor(element, this);
            }))

            let max: { editor: Editor | undefined, zIndex: number } = {
                editor: undefined,
                zIndex: -1
            };

            for (const editor of editors) {
                try {
                    if (await editor.isDisplayed()) {
                        const zIndex = await editor.getZIndex();
                        if (zIndex > max.zIndex) {
                            max = {
                                editor,
                                zIndex
                            };
                        }
                    }
                }
                catch {
                    continue;
                }
            }
            const editor = max.editor;

            if (editor === undefined) {
                return undefined;
            }

            for (const tab of await this.getOpenTabs()) {
                const [type, identification] = await tab.parseTabType();
                if (identification === await editor.getIdentification()) {
                    return await EditorView.create(type, editor, tab);
                }
            }
        }, getTimeout()) as Editor;
    }

    async openEditor(title: string, groupIndex: number = 0): Promise<IEditor> {
        const tab = await this.getTabByTitle(title, groupIndex);
        await tab.select();
        await this.getDriver().wait(() => tab.isSelected(), getTimeout());
        return this.getActiveEditor();
    }

    async closeEditor(title: string, groupIndex: number = 0): Promise<void> {
        const tab = await this.getTabByTitle(title, groupIndex);
        await tab.close();
    }

    async closeAllEditors(groupIndex?: number): Promise<void> {
        const tabs = await this.getOpenTabs(groupIndex);
        for (const tab of tabs) {
            try {
                await tab.close();
            }
            catch (e) {
                if (e.name === 'StaleElementReferenceError') {
                    continue;
                }
                throw e;
            }
        }
    }

    async getOpenEditorTitles(groupIndex: number = 0): Promise<string[]> {
        const titles: string[] = [];

        const tabs = await this.getOpenTabs(groupIndex);
        for (const tab of tabs) {
            try {
                titles.push(await tab.getTitle());
            }
            catch (e) {
                if (e.name === 'StaleElementReferenceError') {
                    continue;
                }
                throw e;
            }
        }

        return titles;
    }

    async getTabByTitle(title: string, groupIndex: number = 0): Promise<EditorTab> {
        return await this.getDriver().wait(async () => {
            const tabs = await this.getOpenTabs(groupIndex);

            for (const tab of tabs) {
                try {
                    if (await tab.getTitle() === title) {
                        return tab;
                    }
                }
                catch (e) {
                    if (e.name === 'StaleElementReferenceError') {
                        continue;
                    }
                    throw e;
                }
            }
            return undefined;
        }, getTimeout(), `Could not find tab with title ${title}, group index: ${groupIndex}.`) as EditorTab;
    }

    async getOpenTabs(groupIndex: number = 0): Promise<EditorTab[]> {
        const tabBars = await this.findElements(TheiaElement.locators.components.editor.tabBar.constructor);

        if (tabBars.length === 0) {
            return [];
        }

        if (groupIndex >= tabBars.length) {
            throw new Error(`Group index is invalid. Group index cannot be larger than group count. Group index: ${groupIndex}, Group count: ${tabBars.length}.`);
        }

        const elements = await tabBars[groupIndex].findElements(TheiaElement.locators.components.editor.tabBar.tab.constructor);
        return elements.map((element) => new EditorTab(element, this));
    }

    async getActiveTab(): Promise<IEditorTab> {
        for (const tab of await this.getOpenTabs()) {
            try {
                if (await tab.isSelected()) {
                    return tab;
                }
            }
            catch (e) {
                if (e.name === 'StaleElementReferenceError') {
                    continue;
                }
                throw e;
            }
        }

        throw new Error('Could find selected tab')
    }

    async getEditorGroups(): Promise<IEditorGroup[]> {
        const tabBars = await this.findElements(TheiaElement.locators.components.editor.tabBar.constructor);
        const groups = [];
        for (let i = 0; i < tabBars.length; i++) {
            groups.push(new EditorGroup(i));
        }
        return groups;
    }

    async getEditorGroup(index: number): Promise<IEditorGroup> {
        return await this.getDriver().wait(async () => {
            const groups = await this.getEditorGroups();

            if (index < groups.length) {
                return groups[index];
            }
            return undefined;
        }, getTimeout(), `Could not get group with index ${index}.`) as IEditorGroup;
    }

    static async create(editorType: string, editor: Editor, tab: IEditorTab): Promise<IEditor> {
        if (editorType.startsWith('shell-tab-')) {
            editorType = editorType.slice('shell-tab-'.length);
        }

        switch (editorType) {
            case 'code-editor-opener':
                return new TextEditor(editor, new EditorView(), tab);
            case 'plugin-webview':
                return new Editor(editor, new EditorView(), tab);
            case 'mini-browser':
                return new Editor(editor, new EditorView(), tab);
            default:
                throw new Error(`Unknown editor type ${editorType}.`);
        }
    }
}
