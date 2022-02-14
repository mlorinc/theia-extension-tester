import { ExtestUntil } from '@theia-extension-tester/until';
import {
    IInputBox,
    InputWidget,
    IQuickPickItem,
    Key,
    QuickPickScroller,
    ScrollItemNotFound,
    SeleniumBrowser,
    TheiaElement
} from '../../../../module';
import { repeat } from '@theia-extension-tester/repeat';


export class InputContainer extends TheiaElement {
    constructor() {
        super(TheiaElement.locators.components.workbench.input.constructor);
    }
}

export class Input extends InputWidget implements IInputBox {
    private container: InputContainer;

    constructor() {
        const container = new InputContainer();
        super({ element: Input.locators.components.workbench.input.field, parent: container });
        this.container = container;
    }

    static async create(timeout?: number): Promise<IInputBox> {
        const input = new Input();
        await input.getDriver().wait(ExtestUntil.elementInteractive(input), this.timeoutManager().defaultTimeout(timeout));
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
        return await repeat(async () => {
            try {
                const scroll = new QuickPickScroller(this);
                return await scroll.findItem(indexOrText, this.timeoutManager().findElementTimeout());
            }
            catch (e) {
                if (e instanceof ScrollItemNotFound) {
                    return undefined;
                }
                throw e;
            }
        }, {
            timeout: this.timeoutManager().defaultTimeout(),
            message: `Could not find quick pick with ${typeof indexOrText === 'number' ? 'index' : 'label'} "${indexOrText}".`
        }) as IQuickPickItem;
    }

    async getTitle(): Promise<string> {
        const fn = Input.locators.components.workbench.input.constructor.properties?.title;

        if (fn) {
            return await fn(this, Input.locators);
        }
        else {
            throw new Error('Input.locators.components.workbench.input.constructor.properties.title is undefined.');
        }
    }

    async back(): Promise<boolean> {
        const buttons = await this.container.findElements(Input.locators.components.workbench.input.back) as TheiaElement[];

        if (buttons.length > 0) {
            await buttons[0].safeClick();
            return true;
        }

        return false;
    }

    async hasProgress(): Promise<boolean> {
        const progress = await this.container.findElements(Input.locators.components.workbench.input.progress) as TheiaElement[];
        return progress.length === 1 && await progress[0].isDisplayed() && !(await progress[0].isEnabled());
    }

    async getQuickPicks(): Promise<IQuickPickItem[]> {
        const scroll = new QuickPickScroller(this);
        return scroll.getVisibleItems();
    }

    async getMessage(): Promise<string> {
        const message = await this.container.findElements(Input.locators.components.workbench.input.message) as TheiaElement[];

        return message.length > 0 ? await message[0].getText() : '';
    }

    async hasError(): Promise<boolean> {
        const errors = await this.container.findElements(Input.locators.components.workbench.input.error);
        return errors.length > 0;
    }

    async isPassword(): Promise<boolean> {
        return await this.getAttribute('type') === 'password';
    }

    async cancel(): Promise<void> {
        await repeat(async () => {
            if (await Input.isOpen() === false) {
                return true;
            }

            try {
                // safe send keys does not work well in this scenario
                await this.focus();
                await this.sendKeys(Key.ESCAPE);
            }
            catch (e) {
                if (e instanceof Error && e.message.includes('element not interactable')) {
                    return false;
                }
                throw e;
            }

            return false;
        }, {
            timeout: this.timeoutManager().defaultTimeout(),
            message: 'Could not cancel input component.'
        });
    }

    async isFocused(): Promise<boolean> {
        return this.container.isFocused();
    }

    async getCounter(): Promise<TheiaElement> {
        const element = await this.container.findElement(QuickPickScroller.locators.components.workbench.input.counter) as TheiaElement;
        return element;
    }

    static async isOpen(): Promise<boolean> {
        const elements = await SeleniumBrowser.instance.driver.findElements(Input.locators.components.workbench.input.constructor.locator);
        return elements.length === 1 && await elements[0].isDisplayed();
    }
}

export { Input as InputBox };
