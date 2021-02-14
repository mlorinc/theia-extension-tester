import { AbstractElement, ITextEditor } from 'extension-tester-page-objects';
import { ContentAssist } from './ContentAssist';
import { Editor } from './Editor';
import { EditorTab } from './EditorTab';
import { EditorView } from './EditorView';
import { TheiaElement } from '../../theia-components/TheiaElement';
import * as clipboardy from "clipboardy";
import { Key } from 'selenium-webdriver';

export class TextEditor extends Editor implements ITextEditor {

    constructor(editor?: TextEditor, editorView?: EditorView, editorTab?: EditorTab) {
        super(editor || TheiaElement.locators.components.editor.activeEditor, editorView, editorTab);
    }

    async click(timeout?: number): Promise<void> {
        const body = await this.findElement(TheiaElement.locators.components.editor.textEditorBody) as TheiaElement;
        await body.click(timeout);
        await body.waitInteractive(timeout);
    }

    async sendKeys(...var_args: (string | Promise<string>)[]): Promise<void> {
        let builder = this.getDriver().actions();
        const controls: {[key: string]: boolean} = {
            [Key.META]: false,
            [AbstractElement.ctlKey]: false,
            [Key.ALT]: false,
            [Key.SHIFT]: false
        }

        for (const key of var_args) {
            const state = controls[await key]; 
            if (state !== undefined) {
                if (state) {
                    builder = builder.keyUp(await key);
                }
                else {
                    builder = builder.keyDown(await key);
                }
                controls[await key] = !controls[await key]
            }
            else {
                builder = builder.sendKeys(key);
            }
        }

        await builder.perform();
    }

    async isDirty(): Promise<boolean> {
        return (await (await this.getEditorTab()).getAttribute('class')).includes('theia-mod-dirty');
    }
    async save(): Promise<void> {
        await this.sendKeys(AbstractElement.ctlKey, 's', AbstractElement.ctlKey);
    }
    async getFileUri(): Promise<string> {
        throw new Error('Not supported');
    }

    async getFilePath(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    async toggleContentAssist(open: boolean): Promise<void | ContentAssist> {
        await this.sendKeys(AbstractElement.ctlKey, Key.SPACE, AbstractElement.ctlKey);
        return new ContentAssist();
    }
    async getText(): Promise<string> {
        await this.click();
        clipboardy.writeSync('getText');
        await this.sendKeys(AbstractElement.ctlKey, 'ac', AbstractElement.ctlKey);
        await this.getDriver().wait(() => clipboardy.readSync() !== 'getText');
        return clipboardy.read();
    }
    async setText(text: string, formatText?: boolean): Promise<void> {
        await this.clearText();
        await this.sendKeys(text);

        if (formatText) {
            console.warn('Text formatting is not supported');
        }
    }

    async clearText(): Promise<void> {
        await this.click();
        await this.sendKeys(AbstractElement.ctlKey, 'a', AbstractElement.ctlKey, Key.DELETE);
    }

    async getTextAtLine(line: number): Promise<string> {
        await this.moveCursor(line, 1);
        await this.sendKeys(Key.SHIFT, Key.END, Key.SHIFT, AbstractElement.ctlKey, 'c', AbstractElement.ctlKey);
        return clipboardy.read();
    }
    async setTextAtLine(line: number, text: string): Promise<void> {
        await this.moveCursor(line, 1);
        await this.sendKeys(Key.END, Key.SHIFT, Key.HOME, Key.SHIFT, Key.BACK_SPACE, text);
    }
    async typeText(line: number, column: number, text: string): Promise<void> {
        await this.moveCursor(line, column);
        await this.sendKeys(text);
    }
    async moveCursor(line: number, column: number): Promise<void> {
        // Todo: optimize
        await this.click();
        await this.sendKeys(AbstractElement.ctlKey, Key.HOME, AbstractElement.ctlKey, ...Array<string>(line - 1).fill(Key.ARROW_DOWN), ...Array<string>(column - 1).fill(Key.ARROW_RIGHT));
    }
    async getNumberOfLines(): Promise<number> {
        const lines = await this.findElement(TheiaElement.locators.components.editor.textEditorLines) as TheiaElement;
        return (await lines.findElements(TheiaElement.locators.components.editor.textEditorLine)).length;
    }
    async formatDocument(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async getTitle(): Promise<string> {
        return (await this.getEditorTab()).getTitle();
    }
    async getTab(): Promise<EditorTab> {
        return this.getEditorTab();
    }
}
