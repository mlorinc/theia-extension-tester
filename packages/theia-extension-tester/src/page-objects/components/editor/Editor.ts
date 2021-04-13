import { Button, Locator, WebElement } from 'selenium-webdriver';
import { ContextMenu } from '../menu/ContextMenu';
import { EditorView } from './EditorView';
import { IEditor, IEditorTab, IMenu } from 'extension-tester-page-objects';
import { TheiaElement } from '../../theia-components/TheiaElement';
import { TheiaLocator } from '../../../locators/TheiaLocators';

export class Editor extends TheiaElement implements IEditor {
    protected editorView: EditorView;
    private editorTab?: IEditorTab;

    constructor(element: WebElement | Locator | TheiaLocator, editorView?: EditorView, editorTab?: IEditorTab) {
        editorView = editorView || new EditorView();
        super(element, editorView);
        this.editorView = editorView;
        this.editorTab = editorTab;
    }

    protected async getEditorTab(): Promise<IEditorTab> {
        if (this.editorTab) {
            return this.editorTab;
        }
        this.editorTab = await this.editorView.getActiveTab();
        return this.editorTab;
    }

    protected async focused(): Promise<boolean> {
        const fn = Editor.locators.components.editor.constructor.properties?.focused;

        if (fn) {
            return await fn(this, Editor.locators);
        }
        else {
            throw new Error('Editor.locators.components.editor.constructor.properties.focused is undefined.');
        }
    }

    async getTitle(): Promise<string> {
        return await (await this.getEditorTab()).getTitle();
    }

    async getTab(): Promise<IEditorTab> {
        return await this.getEditorTab();
    }

    async openContextMenu(): Promise<IMenu> {
        await this.getDriver().actions().click(this, Button.RIGHT).perform();
        return new ContextMenu();
    }

    async getIdentification(): Promise<string> {
        const id = await this.getAttribute('id');
        const index = id.indexOf(':');
        return id.slice(index + 1);
    }

    async getZIndex(): Promise<number> {
        const zIndex = await this.getDriver().executeScript('getComputedStyle(arguments[0]).zIndex', this);

        if (typeof zIndex === 'string') {
            return Number.parseInt(zIndex);
        }
        else {
            return 0;
        }
    }
}
