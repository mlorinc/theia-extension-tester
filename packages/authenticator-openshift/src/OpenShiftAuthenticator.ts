import {
    Button,
    By,
    Key,
    Locator,
    SeleniumBrowser,
    until
} from 'extension-tester-page-objects';

import { TheiaElement } from "@theia-extension-tester/theia-element";
import { Authenticator } from "@theia-extension-tester/base-authenticator";
import { BaseBrowser } from "@theia-extension-tester/base-browser";
import { repeat, TimeoutError } from "@theia-extension-tester/repeat";

export module OpenShiftAuthenticatorMethod {
    export const HTPASSWD_PROVIDER = 'htpasswd_provider';
    export const OPENSHIFT_SRE = 'OpenShift_SRE';
    export const DEVSANDBOX = 'DevSandbox';
}

export interface OpenShiftInputPair {
    name: string;
    value: string;
}

export interface OpenShiftAuthenticatorOptions {
    /**
     * Input data to fill in. In multi step forms, order of data is important.
     */
    inputData: Array<OpenShiftInputPair>;
    /**
     * Login method to use. See OpenShiftAuthenticatorMethod.
     */
    loginMethod?: string;
    /**
     * Flag indicating if multi form algorithm should be used.
     */
    multiStepForm?: boolean;
    timeout?: number;
}

/**
 * OpenShift authenticator which logs in user.
 */
export class OpenShiftAuthenticator implements Authenticator {
    constructor(private options: OpenShiftAuthenticatorOptions) { }

    async authenticate(): Promise<void> {
        const browser = SeleniumBrowser.instance as BaseBrowser;
        const timeout = browser.timeouts.pageLoadTimeout(this.options.timeout) - 5000;

        let counter = 0;
        for (const pair of this.options.inputData) {
            const input = await getInput(By.css('form'), By.name(pair.name), timeout, `Could not find "${pair.name}" input.`);
            console.log(`Filling out "${pair.name}". Visible: ${await input.isDisplayed()}, Enabled: ${await input.isEnabled()}`);
            await input.safeSendKeys(timeout, pair.value);
            console.log(`Filled out "${pair.name}".`);
            counter += 1;

            if (this.options.multiStepForm && counter !== this.options.inputData.length) {
                console.log('Next step.');
                await input.safeSendKeys(timeout, Key.ENTER);
            }
        }

        console.log('Looking for submit.');
        const submitButton = await getInput(By.css('form'), By.xpath('.//*[@type="submit"]'), timeout, `Could not find submit button.`);
        console.log('Found submit.');
        await submitButton.safeClick(Button.LEFT, timeout);
        console.log('Logged in user.');

        if (this.options.loginMethod) {
            const rawLink = await browser.driver.wait(
                until.elementLocated(By.xpath(`//a[text()="${this.options.loginMethod}"]`)),
                browser.timeouts.pageLoadTimeout(this.options.timeout)
            );
            await new Promise((resolve) => setTimeout(resolve, 2500));
            const loginLink = new TheiaElement(rawLink);
            await loginLink.safeClick();
            console.log(`Clicked on login method: "${this.options.loginMethod}".`);
        }
    };
}

async function getInput(formLocator: Locator, locator: Locator, timeout: number, errorMessage: string = 'Could not get input.', interval: number = 500): Promise<TheiaElement> {
    return await repeat(async () => {
        try {
            const forms = await BaseBrowser.findElements(formLocator, interval);

            for (const form of forms) {
                if (await form.isDisplayed().catch(() => false)) {
                    try {
                        const input = form.findElement(locator);
                        if (await input.isDisplayed()) {
                            return input;
                        }
                    }
                    catch (e) {
                        if (e instanceof TimeoutError) {
                            continue;
                        }
                        throw e;
                    }
                }
            }
        }
        catch (e) {
            if (e instanceof TimeoutError) {
                return undefined;
            }
            if ((e instanceof Error) && e.name === 'StaleElementReferenceError') {
                return undefined;
            }

            throw e;
        }

        return undefined;
    }, {
        timeout,
        message: errorMessage
    }) as TheiaElement;
}