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
        await this.getDriver().actions().sendKeys(...var_args).perform();
    }

    async isDirty(): Promise<boolean> {
        const tab = await this.getEditorTab() as EditorTab;
        return await tab.isDirty();
    }

    async save(): Promise<void> {
        await this.sendKeys(Key.chord(AbstractElement.ctlKey, 's'));
        await this.getDriver().wait(async () => await this.isDirty() === false, getTimeout(), 'Could not save editor. Dirty flag is visible.');
    }

    async getFileUri(id?: string): Promise<string> {
        let uri = (id ?? await this.getIdentification()).replace('code-editor-opener:', '');

        const index = uri.lastIndexOf(':');
        if (index >= 0) {
            // Check if string is not number (+ converts string to number or NaN).
            // Handles file:///some/path case.
            // Should not change /some/home/path:5.
            if (isNaN(+(uri.slice(index + 1)))) {
                return uri;
            }

            return uri.slice(0, index);
        }
        else {
            return uri;
        }
    }

    async getFilePath(): Promise<string> {
        return new URL(await this.getFileUri()).pathname;
    }

    async toggleContentAssist(open: boolean): Promise<void | IContentAssist> {
        if (open) {
            if (await ContentAssist.isOpen(this) === false) {
                await this.sendKeys(Key.chord(AbstractElement.ctlKey, Key.SPACE));
            }

            const assist = new ContentAssist(this);
            await this.getDriver().wait(async () => await ContentAssist.isOpen(this) && await assist.isLoaded(), getTimeout(), 'waiting for content assist to load.');
            return assist;
        }
        else {
            await new ContentAssist(this).close();
        }
    }
    async getText(): Promise<string> {
        await this.focus();
        const oldClipboard = clipboardy.readSync();
        try {
            clipboardy.writeSync('getText');
            await this.sendKeys(Key.chord(AbstractElement.ctlKey, 'ac'));
            await this.getDriver().wait(() => clipboardy.readSync() !== 'getText', getTimeout());
            return clipboardy.readSync();
        }
        finally {
            clipboardy.writeSync(oldClipboard);
            await this.sendKeys(Key.ARROW_RIGHT);
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
        await this.sendKeys(Key.chord(AbstractElement.ctlKey, 'a', Key.DELETE));
        await this.getDriver().wait(async () => (await this.getText()).trim().length === 0, getTimeout(), 'Could not clear text.');
    }

    async getTextAtLine(line: number): Promise<string> {
        try {
            await this.moveCursor(line, 1);
            await this.sendKeys(Key.chord(Key.SHIFT, Key.END), Key.chord(AbstractElement.ctlKey, 'c'));
            return clipboardy.read();
        }
        finally {
            await this.sendKeys(Key.ARROW_RIGHT);
        }
    }
    async setTextAtLine(line: number, text: string): Promise<void> {
        await this.moveCursor(line, 1);
        await this.sendKeys(Key.END, Key.chord(Key.SHIFT, Key.HOME), Key.BACK_SPACE, text);
    }
    async typeText(line: number, column: number, text: string): Promise<void> {
        await this.moveCursor(line, column);
        await this.sendKeys(text);
    }
    async moveCursor(line: number, column: number): Promise<void> {
        await this.focus();
        await this.sendKeys(Key.chord(AbstractElement.ctlKey, Key.HOME), ...Array<string>(line - 1).fill(Key.ARROW_DOWN), ...Array<string>(column - 1).fill(Key.ARROW_RIGHT));
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
