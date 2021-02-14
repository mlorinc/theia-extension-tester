import { IInput, QuickPickItem, SeleniumBrowser } from 'extension-tester-page-objects';
import { inputVisible, InputWidget, textCondition } from '../../../theia-components/widgets/input/InputWidget';
import { Key } from 'selenium-webdriver';
import { TheiaElement } from '../../../theia-components/TheiaElement';

export class Input extends TheiaElement implements IInput {
    protected _input!: InputWidget;

    constructor() {
        super(TheiaElement.locators.components.workbench.input.locator);
        this._input = new InputWidget(this);
    }

    private async textCondition(text: string): Promise<boolean> {
        return textCondition(this.input, text);
    }

    private async inputVisible(): Promise<boolean> {
        return inputVisible(this.input);
    }

    private get input(): InputWidget {
        return this._input;
    }

    static async create(_timeout?: number): Promise<Input> {
        const input = new Input();
        await input.isInteractive();
        return input;
    }

    async getText(): Promise<string> {
        return this.input.getText();
    }

    async setText(text?: string): Promise<void> {
        await this.input.setText(text || '');
    }

    async getPlaceHolder(): Promise<string> {
        return this.input.getPlaceHolder();
    }

    async confirm(): Promise<void> {
        await this.input.sendKeys(Key.ENTER);
        await this.getDriver().wait(async () =>
            !(await this.inputVisible()) || await this.textCondition(''),
            await SeleniumBrowser.instance.getImplicitTimeout(),
            'Input.confirm timed out');
    }

    async cancel(): Promise<void> {
        await this.input.sendKeys(Key.ESCAPE);
        await this.getDriver().wait(async () =>
            !(await this.inputVisible()) || await this.textCondition(''),
            await SeleniumBrowser.instance.getImplicitTimeout(),
            'Input.cancel timed out');
    }

    async clear(): Promise<void> {
        await this.input.clear();
    }

    async isInteractive(timeout?: number): Promise<this> {
        await super.waitInteractive(timeout);
        await this.input.waitInteractive(timeout);
        return this;
    }

    selectQuickPick(indexOrText: string | number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    toggleAllQuickPicks(state: boolean): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findQuickPick(indexOrText: string | number): Promise<QuickPickItem | undefined> {
        throw new Error("Method not implemented.");
    }
    getTitle(): Promise<string | undefined> {
        throw new Error("Method not implemented.");
    }
    back(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    hasProgress(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    getQuickPicks(): Promise<QuickPickItem[]> {
        throw new Error("Method not implemented.");
    }
}

export { Input as InputBox };
