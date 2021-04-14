import {
    ExtestUntil,
    getTimeout,
    IInputBox,
    InputWidget,
    IQuickPickItem,
    QuickPickScroller,
    SeleniumBrowser,
    TheiaElement
} from '../../../../module';

export class Input extends InputWidget implements IInputBox {
    constructor() {
        super({ parent: new TheiaElement(TheiaElement.locators.components.workbench.input.constructor) });
    }

    static async create(timeout?: number): Promise<IInputBox> {
        const input = new Input();
        await input.getDriver().wait(ExtestUntil.elementInteractive(input), getTimeout(timeout));
        return input;
    }

    async selectQuickPick(indexOrText: string | number): Promise<void> {
        const pick = await this.findQuickPick(indexOrText);
        await pick.select();
    }

    async toggleAllQuickPicks(state: boolean): Promise<void> {
        throw new Error('Not implemented error');
    }

    async findQuickPick(indexOrText: string | number): Promise<IQuickPickItem> {
        const scroll = new QuickPickScroller(this);
        return scroll.findItem(indexOrText, getTimeout());
    }

    async getTitle(): Promise<string> {
        const fn = Input.locators.components.workbench.input.constructor.properties?.title;

        if (fn) {
            await this.getDriver().wait(() => this.getEnclosingElement() !== undefined, getTimeout(), 'Could not get enclosing element.');
            return await fn(this, Input.locators);
        }
        else {
            throw new Error('Input.locators.components.workbench.input.constructor.properties.title is undefined.');
        }
    }

    async back(): Promise<boolean> {
        const buttons = await this.enclosingItem.findElements(Input.locators.components.workbench.input.back) as TheiaElement[];

        if (buttons.length > 0) {
            await buttons[0].safeClick();
            return true;
        }

        return false;
    }

    async hasProgress(): Promise<boolean> {
        const progress = await this.enclosingItem.findElements(Input.locators.components.workbench.input.progress);
        return progress.length === 1 && await progress[0].isDisplayed();
    }

    async getQuickPicks(): Promise<IQuickPickItem[]> {
        const scroll = new QuickPickScroller(this);
        return scroll.getVisibleItems();
    }

    async getMessage(): Promise<string> {
        return await (await this.getMessageElement()).getText();
    }

    private async getMessageElement(): Promise<TheiaElement> {
        return await this.enclosingItem.findElement(Input.locators.components.workbench.input.message) as TheiaElement;
    }

    async hasError(): Promise<boolean> {
        const errors = await this.enclosingItem.findElements(Input.locators.components.workbench.input.error);
        return errors.length > 0;
    }

    async isPassword(): Promise<boolean> {
        return await this.getAttribute('type') === 'password';
    }

    static async isOpen(): Promise<boolean> {
        const elements = await SeleniumBrowser.instance.driver.findElements(Input.locators.components.workbench.input.constructor.locator);
        return elements.length === 1 && await elements[0].isDisplayed();
    }
}

export { Input as InputBox };
