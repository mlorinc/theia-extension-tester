import {
    Button,
    ContextMenu,
    EditorView,
    getTimeout,
    IEditorTab,
    Menu,
    TheiaElement,
    WebElement
} from '../../../module';

export class EditorTab extends TheiaElement implements IEditorTab {
    constructor(element: WebElement, editor: EditorView) {
        super(element, editor);
    }

    async getTitle(): Promise<string> {
        const fn = EditorTab.locators.components.editor.tabBar.tab.constructor.properties?.title;

        if (fn) {
            return await fn(this, EditorTab.locators);
        }
        else {
            throw new Error('EditorTab.locators.components.editor.tabBar.tab.constructor.properties.title is undefined.');
        }
    }

    async select(): Promise<void> {
        await this.getDriver().wait(async () => {
            await this.safeClick();
            return await this.isSelected();
        }, getTimeout());
    }

    async openContextMenu(): Promise<Menu> {
        await this.safeClick(Button.RIGHT);
        return new ContextMenu();
    }

    async close(): Promise<void> {
        const button = await this.findElement(TheiaElement.locators.components.editor.tabBar.tab.close) as TheiaElement;
        const label = await this.getTitle();

        await this.getDriver().wait(async () => {
            try {
                await button.safeClick();
                return false;
            }
            catch {
                return true;
            }
        }, getTimeout(), `Could not close editor tab with title "${label}".`);
    }

    /**
     * Parse tab id which contains useful info for editor - tab linking.
     * @returns new array with following values: editor type, editor file URI or webview id
     */
    async parseTabType(): Promise<[string, string]> {
        const id = await this.getAttribute('id');
        const colon = id.indexOf(':');
        // return editor type + (uri|id)
        return [id.slice(0, colon), id.slice(colon + 1)];
    }
}
