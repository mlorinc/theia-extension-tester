import {
    Editor,
    EditorGroup,
    EditorTab,
    getTimeout,
    IEditor,
    IEditorGroup,
    IEditorTab,
    IEditorView,
    MiniBrowserEditor,
    SettingsEditor,
    TextEditor,
    TheiaEditorPreview,
    TheiaElement,
    WebView
} from '../../../module';

export class EditorView extends TheiaElement implements IEditorView {
    constructor() {
        super(TheiaElement.locators.components.editor.view);
    }

    async getActiveEditor(): Promise<Editor> {
        return await this.getDriver().wait(async () => {
            const editors = await this.getEditors();

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

            return editor;
        }, getTimeout()) as Editor;
    }

    async getEditors(): Promise<Editor[]> {
        const editorElements = await this.findElements(EditorView.locators.components.editor.constructor) as TheiaElement[];
        return await Promise.all(editorElements.map(async (element) => {
            const rawEditor = new Editor(element, this);
            return await this.create(rawEditor);
        }));
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

    protected async getTab(predicate: ((item: EditorTab) => Promise<boolean>), groupIndex: number, message: string): Promise<EditorTab> {
        return await this.getDriver().wait(async () => {
            const tabs = await this.getOpenTabs(groupIndex);

            for (const tab of tabs) {
                try {
                    if (await predicate(tab)) {
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
        }, getTimeout(), message) as EditorTab;
    }

    async getTabByTitle(title: string, groupIndex: number = 0): Promise<EditorTab> {
        return await this.getTab(
            async (tab) => {
                console.log(`${await tab.getTitle()} === ${title}`);
                return await tab.getTitle() === title
            },
            groupIndex,
            `Could not find tab with title ${title}, group index: ${groupIndex}.`);
    }

    async getTabByIdentification(identification: string, groupIndex: number = 0): Promise<EditorTab> {
        return await this.getTab(
            async (tab) => await tab.getIdentification() === identification,
            groupIndex,
            `Could not find tab with id ${identification}, group index: ${groupIndex}.`);
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

    async create(editorElement: Editor): Promise<Editor> {
        const classes = await editorElement.getAttribute('class');
        const tab = await this.getTabByIdentification(await editorElement.getIdentification());

        if (classes.includes('theia-settings-container')) {
            return new SettingsEditor(editorElement, this, tab);
        }

        if (classes.includes('theia-editor-preview')) {
            return new TheiaEditorPreview(editorElement, this, tab);
        }

        if (classes.includes('theia-editor')) {
            return new TextEditor(editorElement, this, tab);
        }

        const id = await editorElement.getAttribute('id');

        if (id.startsWith('mini-browser')) {
            return new MiniBrowserEditor(editorElement, this, tab);
        }

        if (classes.includes('theia-webview')) {
            return new WebView(editorElement, this, tab);
        }

        throw new Error(`Unknown editor type: <${await editorElement.getTagName()} id="${id}" class="${classes}">`);
    }
}
