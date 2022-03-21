import {
    Button,
    By,
    error,
    Key,
    Locator,
    SeleniumBrowser
} from 'extension-tester-page-objects';

import { TheiaElement } from "@theia-extension-tester/theia-element";
import { Authenticator } from "@theia-extension-tester/base-authenticator";
import { BaseBrowser } from "@theia-extension-tester/base-browser";
import { LoopStatus, repeat, TimeoutError } from "@theia-extension-tester/repeat";

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

        const inputIterator = this.options.inputData.entries();
        let currentEntry: IteratorResult<[number, OpenShiftInputPair], any> | undefined = undefined;

        let loginButtonClicked = this.options.loginMethod === undefined;
        let inputFilledIn = false;
        let sentSubmit = false;

        await repeat(async () => {
            if (loginButtonClicked && inputFilledIn && sentSubmit) {
                return true;
            }

            if (!inputFilledIn) {
                currentEntry = currentEntry ?? inputIterator.next();
                if (currentEntry.done) {
                    inputFilledIn = true;
                }
                else {
                    const [_, pair] = currentEntry.value;
                    try {
                        const input = await this.handleInput(pair, 0);
                        const done: boolean | undefined = currentEntry.done;
                        currentEntry = undefined;

                        if (this.options.multiStepForm && (done === undefined || done === false)) {
                            console.log('Next step.');
                            await input.safeSendKeys(timeout, Key.ENTER);
                        }
                    }
                    catch (e) {
                        if ((e instanceof TimeoutError) === false) {
                            throw e;
                        }
                    }
                }
            }

            if (inputFilledIn && !sentSubmit) {
                console.log('Looking for submit.');
                const submitButton = await getInput(By.css('form'), By.xpath('.//*[@type="submit"]'), timeout, `Could not find submit button.`);
                console.log('Found submit.');
                await submitButton.safeClick(Button.LEFT, timeout);
                console.log('Logged in user.');
                sentSubmit = true;
            }

            if (!loginButtonClicked) {
                try {
                    await this.clickLoginButton(browser, 0);
                    loginButtonClicked = true;
                }
                catch (e) {
                    if ((e instanceof TimeoutError) === false) {
                        throw e;
                    }
                }
            }

            return false;
        }, {
            timeout: browser.timeouts.pageLoadTimeout(timeout),
            message: 'Could not log in to Eclipse Che.'
        });
    };

    private async clickLoginButton(browser: BaseBrowser, timeout: number) {
        const loginLink = await new TheiaElement(
            By.xpath(`//a[text()="${this.options.loginMethod}"]`),
            undefined,
            undefined,
            browser.timeouts.pageLoadTimeout(timeout)
        ).wait();

        await new Promise((resolve) => setTimeout(resolve, 2500));
        await loginLink.safeClick();
        console.log(`Clicked on login method: "${this.options.loginMethod}".`);
    }

    private async handleInput(pair: OpenShiftInputPair, timeout: number) {
        const input = await getInput(By.css('form'), By.name(pair.name), timeout, `Could not find "${pair.name}" input.`);
        console.log(`Filling out "${pair.name}". Visible: ${await input.isDisplayed()}, Enabled: ${await input.isEnabled()}`);
        await input.safeSendKeys(timeout, pair.value);
        console.log(`Filled out "${pair.name}".`);
        return input;
    }
}

async function getInput(formLocator: Locator, locator: Locator, timeout: number, errorMessage: string = 'Could not get input.'): Promise<TheiaElement> {
    return await repeat(async () => {
        try {
            const forms = await BaseBrowser.findElements(formLocator);

            for (const form of forms) {
                if (await form.isDisplayed().catch(() => false)) {
                    const inputs = await form.findElements(locator);

                    if (inputs.length > 1) {
                        console.warn(`[WARNING] Form with id "${await form.getAttribute('id')}" contains multiple inputs with locator "${locator.toString()}".`);
                    }

                    if (inputs.length > 0 && await inputs[0].isDisplayed()) {
                        return inputs[0];
                    }
                }
            }
        }
        catch (e) {
            if (e instanceof error.StaleElementReferenceError) {
                return {
                    loopStatus: LoopStatus.LOOP_UNDONE
                };
            }

            throw e;
        }

        return {
            loopStatus: LoopStatus.LOOP_DONE
        };
    }, {
        timeout,
        message: errorMessage
    }) as TheiaElement;
}