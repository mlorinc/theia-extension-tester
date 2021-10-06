import { Button, error, WebDriver, WebElement, WebElementCondition } from "extension-tester-page-objects";

export namespace ExtestUntil {
    export function elementInteractive(element: WebElement): WebElementCondition {
        const fn = async function (): Promise<WebElement | undefined> {
            try {
                if (await isInteractive(element)) {
                    return element;
                }
            }
            catch (e) {
                if (e instanceof error.StaleElementReferenceError) {
                    throw e;
                }
            }
            return undefined;
        };

        return new WebElementCondition('for element to be interactive (visible + enabled).', fn);
    }

    export function safeClick(element: WebElement, button: string = Button.LEFT): WebElementCondition {
        const fn = async function (driver: WebDriver): Promise<WebElement | undefined> {
            try {
                if (await isInteractive(element)) {
                    if (button === Button.LEFT) {
                        await element.click();
                    }
                    else {
                        await driver.actions().click(element, button).perform();
                    }
                    return element;
                }
                else {
                    return undefined;
                }
            }
            catch (e) {
                if (e instanceof error.WebDriverError && e.message.includes('element click intercepted: Element')) {
                    console.warn(e.message);
                    return undefined;
                }
                throw e;
            }
        };

        return new WebElementCondition('for element to be clicked. Make sure the elements is enabled, visible and not covered by other element.', fn);
    }

    export function safeSendKeys(element: WebElement, ...var_args: (string | number | Promise<string | number>)[]): WebElementCondition {
        const fn = async function (): Promise<WebElement | undefined> {
            try {
                if (await isInteractive(element)) {
                    await element.sendKeys(...var_args);
                    return element;
                }
                else {
                    return undefined;
                }
            }
            catch {
                return undefined;
            }
        };

        return new WebElementCondition('for element to be clicked. Make sure the elements is enabled, visible and not covered by other element.', fn);
    }
}

async function isInteractive(element: WebElement): Promise<boolean> {
    return await element.isDisplayed() && await element.isEnabled();
}
