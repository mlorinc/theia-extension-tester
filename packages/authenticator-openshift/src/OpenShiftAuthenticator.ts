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
 * Authenticator object is used when Eclipse Che requires an user to log in.
 * Every authenticator objects has access to Selenium WebDriver.
 * This package supports only Eclipse Che instances
 * installed from [OperatorHub](https://operatorhub.io/).
 *
 * @example
 *  // Log in user into Eclipse Che
 *  import { OpenShiftAuthenticator } from "@theia-extension-tester/openshift-authenticator";
 *
 *  const auth = new OpenShiftAuthenticator({
 *      // Form data array in format (input name, input value).
 *      inputData: [
 *          {
 *              // Input field name. Leave unchanged.
 *              name: "username",
 *              // Eclipse Che user name.
 *              //Recommended to store in .env file.
 *              value: process.env.CHE_USERNAME
 *          },
 *          {
 *              // Input field name. Leave unchanged.
 *              name: "password",
 *              // Eclipse Che user password.
 *              // Recommended to store in .env file.
 *              value: process.env.CHE_PASSWORD
 *          },
 *          // ... and other values if needed
 *      ],
 *      // Depends if form is split into multiple forms.
 *      // Leave false if single form is used.
 *      multiStepForm: false,
 *      // Login method button text.
 *      // Might have multiple variants (e.g. my_htpasswd_provider)
 *      loginMethod: "DevSandbox"
 *  });
 *
 *  // Start authentication process;
 *  await auth.authenticate();
 */
export class OpenShiftAuthenticator implements Authenticator {
    constructor(private options: OpenShiftAuthenticatorOptions) { }

    /**
     * Authenticate user into Eclipse Che. Supports only Eclipse Che instances
     * installed from OperatorHub.
     */
    async authenticate(): Promise<void> {
        const browser = SeleniumBrowser.instance as BaseBrowser;
        const timeout = browser.timeouts.pageLoadTimeout(this.options.timeout);

        // Create iteration plan. Returns iterator of pair and boolean values.
        // Boolean values are used as flags when enter will be pressed to proceed
        // into next section of input form.
        const inputIterator = addNextStepFlags(this.options.inputData, this.options.multiStepForm ?? false).entries();


        // If login method button was not defined then skip it.
        let loginButtonClicked = this.options.loginMethod === undefined;
        let inputFilledIn = false;
        let sentSubmit = false;
        let currentEntry: IteratorResult<[number, boolean | OpenShiftInputPair]> = inputIterator.next();
        let previousEntry: IteratorResult<[number, boolean | OpenShiftInputPair]> = currentEntry;

        const createError = async (errors?: string[]) =>
         `Could not log into Eclipse Che. Verification errors:\n\t${(errors ?? await verificationErrors()).join('\n\t')}`;

        await repeat(async () => {
            // Everything was performed successfully on background.
            if (loginButtonClicked && inputFilledIn && sentSubmit) {
                return true;
            }

            const inputErrors = await verificationErrors();
            if (inputErrors.length > 0) {
                throw new Error(await createError(inputErrors));
            }

            // Inputs were not filled in.
            if (!inputFilledIn) {
                if (currentEntry.done) {
                    inputFilledIn = true;
                }
                else {
                    // Ignore index.
                    const currentPairOrNextStepFlag = currentEntry.value[1];
                    const previousPairOrNextStepFlag = previousEntry.value[1];

                    if (typeof currentPairOrNextStepFlag === 'boolean') {
                        const input = await getInputForPair(previousPairOrNextStepFlag, timeout);
                        const successfulNextStep = await nextStep(input, timeout);

                        if (successfulNextStep) {
                            previousEntry = currentEntry;
                            currentEntry = inputIterator.next();
                        }
                    }
                    else {
                        const successfulTypeIn = await typeIn(currentPairOrNextStepFlag);

                        if (successfulTypeIn) {
                            previousEntry = currentEntry;
                            currentEntry = inputIterator.next();
                        }
                    }
                }
            }

            if (inputFilledIn && !sentSubmit) {
                await this.submit(timeout);
                sentSubmit = true;
            }

            if (!loginButtonClicked) {
                try {
                    // Non blocking click.
                    await this.clickLoginButton(browser, 0);
                    loginButtonClicked = true;
                }
                catch (e) {
                    ignoreTimeout(e);
                }
            }

            return false;
        }, {
            timeout: browser.timeouts.pageLoadTimeout(timeout),
            message: createError
        });
    };

    private async submit(timeout: number) {
        console.log('Looking for submit.');
        const submitButton = await getInput(By.css('form'), By.xpath('.//*[@type="submit"]'), timeout, `Could not find submit button.`);
        console.log('Found submit.');
        await submitButton.safeClick(Button.LEFT, timeout);
        console.log('Logged in user.');
    }

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
}

async function verificationErrors(): Promise<string[]> {
    const elements = await BaseBrowser.findElements(By.xpath(`.//*[contains(@id, 'verification-error')]`));
    const texts = await Promise.all(elements.map((e) => e.getText()));
    return [...new Set(texts.filter((x) => x.trim().length > 0))];
}

function ignoreTimeout(e: unknown) {
    if ((e instanceof TimeoutError) === false) {
        throw e;
    }
}

async function handleInput(pair: OpenShiftInputPair, timeout: number) {
    const input = await getInputForPair(pair, timeout);
    console.log(`Filling out "${pair.name}". Visible: ${await input.isDisplayed()}, Enabled: ${await input.isEnabled()}`);
    await input.safeSendKeys(timeout, pair.value);
    console.log(`Filled out "${pair.name}".`);
    return input;
}

async function getInputForPair(pair: OpenShiftInputPair, timeout: number) {
    return await getInput(By.css('form'), By.name(pair.name), timeout, `Could not find "${pair.name}" input.`);
}

async function typeIn(pairOrNextStepFlag: OpenShiftInputPair): Promise<boolean> {
    try {
        await handleInput(pairOrNextStepFlag, 0);
        return true;
    }
    catch (e) {
        ignoreTimeout(e);
        return false;
    }
}

async function nextStep(input: TheiaElement, timeout: number): Promise<boolean> {
    try {
        console.log('Next step.');
        await input.safeSendKeys(timeout, Key.ENTER);
        return true;
    }
    catch (e) {
        ignoreTimeout(e);
        return false;
    }
}

async function getInput(formLocator: Locator, locator: Locator, timeout: number, errorMessage: string = 'Could not get input.'): Promise<TheiaElement> {
    return await repeat(async () => {
        try {
            // Find all forms on the web page.
            const forms = await BaseBrowser.findElements(formLocator);

            for (const form of forms) {
                // Filter visible forms
                if (await form.isDisplayed().catch(() => false)) {
                    // Find all inputs. Warn user if suspicious locator was used.
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
            // Some form or input might have become stale. This might be recoverable.
            if (e instanceof error.StaleElementReferenceError) {
                return {
                    loopStatus: LoopStatus.LOOP_UNDONE
                };
            }

            throw e;
        }

        // Nothing was found. But consider loop to be finished (no errors).
        return {
            loopStatus: LoopStatus.LOOP_DONE
        };
    }, {
        timeout,
        message: errorMessage
    }) as TheiaElement;
}

function addNextStepFlags(data: OpenShiftInputPair[], multiStep: boolean) {
    if (!multiStep || data.length < 2) {
        return data;
    }

    const out = [];
    for (const d of data) {
        out.push(d);
        out.push(true);
    }

    out.pop()
    console.log(out);
    return out;
}
