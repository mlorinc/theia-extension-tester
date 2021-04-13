import { ExtestUntil, getTimeout, repeat } from 'extension-tester-page-objects';
import { Button, Key, Locator, WebElement } from 'selenium-webdriver';
import { TheiaLocator } from '../../../../locators/TheiaLocators';
import { TheiaElement } from '../../TheiaElement';

export interface InputWidgetOptions {
    element?: WebElement | Locator | TheiaLocator;
    parent?: WebElement | Locator | TheiaLocator;
}
export class InputWidget extends TheiaElement {
    constructor(options?: InputWidgetOptions) {
        super(options?.element || TheiaElement.locators.widgets.input, options?.parent);
    }

    /**
     * input.getAttribute('value') does not always return actual value. It is caused by invisible input element.
     * @returns actual value of input
     */
    private async getInputValue(): Promise<string> {
        let value = await this.getDriver().executeScript('arguments[0].value', this);

        if (value === null || value === undefined) {
            value = '';
        }

        return value as string;
    }

    async getText(): Promise<string> {
        return this.getAttribute('value');
    }

    async setText(text: string, timeout?: number): Promise<void> {
        await this.safeSetText(text, timeout, 0);
    }

    async safeSetText(text: string, timeout?: number, threshold?: number): Promise<void> {
        await this.getDriver().wait(ExtestUntil.elementInteractive(this), getTimeout(timeout));
        await this.safeClick(Button.LEFT, timeout);
        await this.safeClear(timeout, threshold);
        await this.getDriver().wait(ExtestUntil.elementInteractive(this), getTimeout(timeout));
        await this.safeSendKeys(timeout, text);
        await this.getDriver().wait(
            async () => await this.getText() === text,
            timeout,
            `Timed out setting text to "${text}". Input text: "${await this.getText()}"`
        );
    }

    async confirm(timeout?: number): Promise<void> {
        await this.safeSendKeys(timeout, Key.ENTER);
    }

    async cancel(timeout?: number): Promise<void> {
        await this.safeClick(undefined, timeout);
        await this.getDriver().actions().sendKeys(Key.ESCAPE).perform();
    }

    async getPlaceHolder(): Promise<string> {
        return this.getAttribute('placeholder');
    }

    async getTitle(): Promise<string> {
        return this.getAttribute('title');
    }

    async clear(timeout?: number): Promise<void> {
        await this.safeClear(timeout, 0);
    }

    async safeClear(timeout?: number, clearThreshold: number = 1000): Promise<void> {
        await repeat(async () => {
            await this.getDriver().wait(ExtestUntil.elementInteractive(this), getTimeout(timeout));
            const value = await this.getInputValue();
            const text = await this.getText();

            if (text === '' && value === '') {
                return true;
            }
            await this.getDriver().actions()
                .sendKeys(Key.HOME)
                .keyDown(Key.SHIFT)
                .sendKeys(Key.END)
                .keyUp(Key.SHIFT)
                .sendKeys(Key.BACK_SPACE)
                .perform();

            return false;
        }, {
            id: 'InputWidget.clear',
            timeout: getTimeout(timeout),
            threshold: clearThreshold,
            message: `Could not clear input field: "${await this.getText()}". Value: "${this.getInputValue()}".`
        });
    }
}
