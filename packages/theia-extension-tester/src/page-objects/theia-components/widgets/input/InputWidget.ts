import { Key, Locator, WebElement } from "selenium-webdriver";
import { SeleniumBrowser } from "extension-tester-page-objects";
import { TheiaElement } from "../../TheiaElement";

export class InputWidget extends TheiaElement {
    constructor(parent: WebElement | Locator) {
        super(TheiaElement.locators.widgets.input, parent);
    }

    async getText(): Promise<string> {
        return this.getAttribute('value');
    }

    async setText(text: string): Promise<void> {
        await this.clear();
        await this.sendKeys(text);
        await this.getDriver().wait(() => textCondition(this, text), await SeleniumBrowser.instance.getImplicitTimeout(), 'InputWidget.setText timed out');
    }

    async confirm(): Promise<void> {
        await this.sendKeys(Key.ENTER);
    }

    async cancel(): Promise<void> {
        await this.sendKeys(Key.ESCAPE);
    }

    async getPlaceHolder(): Promise<string> {
        return this.getAttribute('placeholder');
    }

    async clear(): Promise<void> {
        await this.sendKeys(Key.chord(TheiaElement.ctlKey, 'a'), Key.DELETE);
        await this.getDriver().wait(() => textCondition(this, ''), await SeleniumBrowser.instance.getImplicitTimeout(), 'InputWidget.clear timed out');
    }
}

export async function textCondition(input: InputWidget, text: string): Promise<boolean> {
    try {
        return await input.getText() === text;
    }
    catch {
        return false;
    }
}

export async function inputVisible(input: InputWidget): Promise<boolean> {
    return input.isDisplayed().catch(() => false);
}
