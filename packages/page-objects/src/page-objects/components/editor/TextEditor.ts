import * as clipboardy from 'clipboardy';
import {
    Button,
    ContentAssist,
    ContextMenu,
    Editor,
    EditorTab,
    EditorView,
    ElementRepeatAction,
    IContentAssist,
    IContextMenu,
    IEditorTab,
    ITextEditor,
    Key,
    SeleniumBrowser,
    TheiaElement,
    WebElementPromise
} from '../../../module';
import { URL } from 'url';
import { repeat, TimeoutError } from '@theia-extension-tester/repeat';

export class TextEditor extends Editor implements ITextEditor {

    constructor(editor?: TheiaElement, editorView?: EditorView, editorTab?: IEditorTab) {
        editorView = editorView || new EditorView();
        super(editor || new WebElementPromise(SeleniumBrowser.instance.driver, editorView.getActiveEditor()), editorView, editorTab);
    }

    protected async cancelHighlight(clipboardBackup?: string): Promise<void> {
        let backup = clipboardBackup ?? await clipboardy.read();
        try {
            await this.sendKeys(Key.HOME, Key.END);
        }
        finally {
            await clipboardy.write(backup);
        }
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
        await this.sendKeys(Key.chord(TextEditor.ctlKey, 's'));
        await this.getDriver().wait(async () => await this.isDirty() === false, this.timeoutManager().defaultTimeout(), 'Could not save editor. Dirty flag is visible.');
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
            const action = new ElementRepeatAction(this, 500);
            return await repeat(async () => {
                if (await ContentAssist.isOpen(this) === true) {
                    return new ContentAssist(undefined, this);
                }
                await action.perform(async () => {
                    await this.focus();
                    await this.sendKeys(Key.chord(TextEditor.ctlKey, Key.SPACE));
                });
                return undefined;
            }, {
                timeout: this.timeoutManager().findElementTimeout(),
                message: 'Cloud not toggle content assist.'
            }) as IContentAssist;
        }
        else {
            if (await ContentAssist.isOpen(this) === true) {
                await new ContentAssist(undefined, this).close();
            }
        }
    }
    async getText(): Promise<string> {
        await this.focus();
        const oldClipboard = clipboardy.readSync();
        try {
            clipboardy.writeSync('getText');
            await this.sendKeys(Key.chord(TextEditor.ctlKey, 'ac'));
            await this.getDriver().wait(() => clipboardy.readSync() !== 'getText', this.timeoutManager().defaultTimeout());
            return clipboardy.readSync();
        }
        finally {
            await this.cancelHighlight(oldClipboard);
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
        await this.sendKeys(Key.chord(TextEditor.ctlKey, 'a', Key.DELETE));
        await this.getDriver().wait(async () => (await this.getText()).trim().length === 0, this.timeoutManager().defaultTimeout(), 'Could not clear text.');
    }

    async getTextAtLine(line: number): Promise<string> {
        let text: string = '';
        let clipboardBackup = await clipboardy.read();
        try {
            await this.moveCursor(line, 1);
            await this.sendKeys(Key.chord(Key.SHIFT, Key.END), Key.chord(TextEditor.ctlKey, 'c'));
            text = await clipboardy.read();
            return text;
        }
        finally {
            if (text.length > 0) {
                await this.cancelHighlight(clipboardBackup);
            }
            else {
                await clipboardy.write(clipboardBackup);
            }
        }
    }
    async setTextAtLine(line: number, text: string): Promise<void> {
        const newLineIndex = text.lastIndexOf('\n');
        if (newLineIndex !== -1) {
            throw new Error(`setTextAtLine does not support strings with "\\n". Got: "${text.replace(/\\n/g, '<EOL>')}".`);
        }

        await this.moveCursor(line, 1);
        await this.sendKeys(Key.END, Key.chord(Key.SHIFT, Key.HOME), Key.BACK_SPACE, text);

        try {
            await repeat(async () => await this.getTextAtLine(line) === text, {
                timeout: this.timeoutManager().defaultTimeout(),
                message: `Could not set text at line ${line} to "${text}".`
            })
        }
        catch (e) {
            const text = await this.getTextAtLine(line).catch(() => '');
            if (e instanceof TimeoutError && text) {
                e.appendMessage(` Current text on line ${line}: "${text}".`);
            }
            throw e;
        }
    }
    async typeText(line: number, column: number, text: string): Promise<void> {
        await this.moveCursor(line, column);
        await this.sendKeys(text);
    }
    async moveCursor(line: number, column: number): Promise<void> {
        await this.focus();
        await this.sendKeys(Key.chord(TextEditor.ctlKey, Key.HOME), ...Array<string>(line - 1).fill(Key.ARROW_DOWN), ...Array<string>(column - 1).fill(Key.ARROW_RIGHT));
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

    async openContextMenu(): Promise<IContextMenu> {
        await this.safeClick(Button.RIGHT);
        return new ContextMenu();
    }
}
