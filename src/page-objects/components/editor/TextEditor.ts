import * as clipboardy from 'clipboardy';
import {
    AbstractElement,
    Button,
    ContentAssist,
    ContextMenu,
    Editor,
    EditorTab,
    EditorView,
    getTimeout,
    IContentAssist,
    IEditorTab,
    IMenu,
    ITextEditor,
    Key,
    TheiaElement,
    WebElementPromise
} from '../../../module';
import { URL } from 'url';

export class TextEditor extends Editor implements ITextEditor {

    constructor(editor?: TheiaElement, editorView?: EditorView, editorTab?: IEditorTab) {
        editorView = editorView || new EditorView();
        super(editor || new WebElementPromise(TextEditor.driver, editorView.getActiveEditor()), editorView, editorTab);
    }

    async click(timeout?: number): Promise<void> {
        const body = await this.findElement(TheiaElement.locators.components.editor.body) as TheiaElement;
        await body.safeClick(Button.LEFT, timeout);
    }

    async sendKeys(...var_args: (string | Promise<string>)[]): Promise<void> {
        let builder = this.getDriver().actions();
        const controls: { [key: string]: boolean } = {
            [Key.META]: false,
            [Key.ALT]: false,
            [Key.SHIFT]: false,
            [Key.COMMAND]: false,
            [Key.CONTROL]: false
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
        const tab = await this.getEditorTab() as EditorTab;
        return await tab.isDirty();
    }

    async save(): Promise<void> {
        await this.sendKeys(AbstractElement.ctlKey, 's', AbstractElement.ctlKey);
        await this.getDriver().wait(async () => await this.isDirty() === false, getTimeout(), 'Could not save editor. Dirty flag is visible.');
    }

    async getFileUri(): Promise<string> {
        const id = await this.getAttribute('id');
        const colon = id.indexOf(':');
        return id.slice(colon + 1);
    }

    async getFilePath(): Promise<string> {
        return new URL(await this.getFileUri()).pathname;
    }

    async toggleContentAssist(open: boolean): Promise<void | IContentAssist> {
        if (open) {
            if (await ContentAssist.isOpen(this) === false) {
                await this.sendKeys(AbstractElement.ctlKey, Key.SPACE, AbstractElement.ctlKey);
            }

            const assist = new ContentAssist(this);
            await this.getDriver().wait(async () => await ContentAssist.isOpen(this) && await assist.isLoaded(), getTimeout(), 'waiting for content assist to load.');
            return assist;
        }
        else {
            if (await ContentAssist.isOpen(this) === true) {
                await this.sendKeys(Key.ESCAPE);
                await this.getDriver().wait(async () => await ContentAssist.isOpen(this) === false, getTimeout(), 'waiting for content assist to close.');
            }
        }
    }
    async getText(): Promise<string> {
        await this.focus();
        const oldClipboard = clipboardy.readSync();
        try {
            clipboardy.writeSync('getText');
            await this.sendKeys(AbstractElement.ctlKey, 'ac', AbstractElement.ctlKey);
            await this.getDriver().wait(() => clipboardy.readSync() !== 'getText', getTimeout());
            return clipboardy.readSync();
        }
        finally {
            clipboardy.writeSync(oldClipboard);
        }
    }
    async setText(text: string, formatText?: boolean): Promise<void> {
        await this.clearText();
        await this.sendKeys(text);

        if (formatText) {
            console.warn('Text formatting is not supported');
        }
    }

    async clearText(): Promise<void> {
        await this.focus();
        await this.sendKeys(AbstractElement.ctlKey, 'a', AbstractElement.ctlKey, Key.DELETE);
        await this.getDriver().wait(async () => (await this.getText()).trim().length === 0, getTimeout(), 'Could not clear text.');
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
        await this.focus();
        await this.sendKeys(AbstractElement.ctlKey, Key.HOME, AbstractElement.ctlKey, ...Array<string>(line - 1).fill(Key.ARROW_DOWN), ...Array<string>(column - 1).fill(Key.ARROW_RIGHT));
    }
    async getNumberOfLines(): Promise<number> {
        const lines = await this.findElement(TheiaElement.locators.components.editor.lines) as TheiaElement;
        return (await lines.findElements(TheiaElement.locators.components.editor.line)).length;
    }
    async formatDocument(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async getTab(): Promise<IEditorTab> {
        return this.getEditorTab();
    }

    protected async getCursor(): Promise<TheiaElement> {
        return await this.findElement(TextEditor.locators.components.editor.cursor) as TheiaElement;
    }

    async focus(): Promise<void> {
        const cursor = await this.getCursor();
        await cursor.safeClick(Button.LEFT);
    }

    async openContextMenu(): Promise<IMenu> {
        const cursor = await this.getCursor();
        await this.focus();
        await cursor.safeClick(Button.RIGHT);
        return new ContextMenu();
    }
}
