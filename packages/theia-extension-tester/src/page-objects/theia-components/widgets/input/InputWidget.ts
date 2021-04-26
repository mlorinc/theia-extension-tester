import {
    AbstractElement,
    getTimeout,
    Key,
    Locator,
    repeat,
    SeleniumBrowser,
    TheiaElement,
    TheiaLocator,
    WebElement
} from '../../../../module';
import * as clipboardy from "clipboardy";

export interface InputWidgetOptions {
    element?: WebElement | Locator | TheiaLocator;
    parent?: WebElement | Locator | TheiaLocator;
}
export class InputWidget extends TheiaElement {
    constructor(options?: InputWidgetOptions) {
        super(options?.element || TheiaElement.locators.widgets.input, options?.parent);
    }

    async getText(): Promise<string> {
        // can return null
        return (await this.getAttribute('value')) ?? '';
    }

    async setText(text: string, timeout?: number): Promise<void> {
        await this.safeSetText(text, timeout);
    }

    async safeSetText(text: string, timeout?: number): Promise<void> {
        const oldClipboard = clipboardy.readSync();

        async function waitCondition(this: InputWidget) {
            return text === await this.getText();
        }

        try {
            timeout = getTimeout(timeout);
            // choose slower approach, multi step input
            await this.safeClear(timeout, 500);
            clipboardy.writeSync(text);
            await this.safeSendKeys(timeout, Key.chord(AbstractElement.ctlKey, 'v'));

            await repeat(waitCondition.bind(this), {
                timeout: getTimeout(timeout),
                message: `Could not set text: "${text}".`
            });
        }
        finally {
            clipboardy.writeSync(oldClipboard);
        }
    }

    async confirm(timeout?: number): Promise<void> {
        timeout = getTimeout(timeout);
        await this.focus();
        await this.safeSendKeys(timeout, Key.ENTER);
    }

    async clear(): Promise<void> {
        await this.safeClear();
    }

    async safeClear(timeout?: number, threshold?: number): Promise<void> {
        timeout = getTimeout(timeout);
        let scheduler: NodeJS.Timeout;


        async function clear(this:InputWidget) {
            await this.safeSendKeys(timeout || SeleniumBrowser.instance.findElementTimeout,
                Key.END, Key.chord(Key.SHIFT, Key.HOME, Key.BACK_SPACE));
            scheduler = setTimeout(clear.bind(this), 1500);
        }

        await clear.call(this);

        await repeat(async () => {
            const text = await this.getText();
            if (text === '') {
                clearTimeout(scheduler);
                scheduler = setTimeout(clear.bind(this), 1500);
                return true;
            } 
        }, {
            timeout,
            threshold,
            message: 'Could not clear input on time.'
        }).finally(() => clearTimeout(scheduler));
    }

    async getPlaceHolder(): Promise<string> {
        return (this.getAttribute('placeholder')) ?? '';
    }

    async getTitle(): Promise<string> {
        return (await this.getAttribute('title')) ?? '';
    }

    async focus(): Promise<void> {
        await repeat(async () => {
            if (await this.isFocused()) {
                return true;
            }
            await this.safeClick();
            return false;
        }, {
            timeout: getTimeout(),
            message: 'Could not focus input widget.'
        });
    }

    async isFocused(): Promise<boolean> {
        return true;
    }
}
