import { Button, Locator, WebElement } from 'selenium-webdriver';
import { ContextMenu } from '../menu/ContextMenu';
import { EditorTab } from './EditorTab';
import { EditorView } from './EditorView';
import { IEditor } from 'extension-tester-page-objects';
import { Menu } from '../menu/Menu';
import { TheiaElement } from '../../theia-components/TheiaElement';
import { TheiaLocator } from '../../../locators/TheiaLocators';

export class Editor extends TheiaElement implements IEditor {
    constructor(element: WebElement | Locator | TheiaLocator, protected editorView?: EditorView, protected editorTab?: EditorTab) {
        super(element, editorView || new EditorView());
        this.editorView = this.enclosingItem as EditorView;
    }

    protected async getEditorTab(): Promise<EditorTab> {
        if (this.editorTab) {
            return this.editorTab;
        }
        this.editorTab = await this.editorView!.getActiveTab();
        return this.editorTab;
    }

    async getTitle(): Promise<string> {
        return await (await this.getEditorTab()).getTitle();
    }

    async getTab(): Promise<EditorTab> {
        return await this.getEditorTab();
    }

    async openContextMenu(): Promise<Menu> {
        await this.getDriver().actions().click(this, Button.RIGHT).perform();
        const menus = await this.getDriver().findElements(TheiaElement.locators.components.menu.contextMenu.locator);
        return new ContextMenu(menus[0], this);
    }
}
