import {
    Authenticator,
    BaseBrowser,
    Button,
    By,
    getTimeout,
    Key,
    SeleniumBrowser,
    TheiaElement,
    until
} from '../module';

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
        const timeout = getTimeout(this.options.timeout);
        const browser = SeleniumBrowser.instance as BaseBrowser;

        const form = new TheiaElement(By.css('form'));
        console.log('Found form.');

        let counter = 0;
        for (const pair of this.options.inputData) {
            const input = await form.findElement(By.name(pair.name)) as TheiaElement;
            console.log(`Filling out "${pair.name}". Visible: ${await input.isDisplayed()}, Enabled: ${await input.isEnabled()}`);
            await input.safeSendKeys(timeout, pair.value);
            console.log(`Filled out "${pair.name}".`);
            counter += 1;

            if (this.options.multiStepForm && counter !== this.options.inputData.length) {
                console.log('Next step.');
                await input.safeSendKeys(timeout, Key.ENTER);
                await new Promise((resolve) => setTimeout(resolve, 750));
            }
        }

        console.log('Looking for submit.');
        const submitButton = await form.findElement(By.xpath('.//*[@type="submit"]')) as TheiaElement;
        console.log('Found submit.');
        await submitButton.safeClick(Button.LEFT, timeout);
        console.log('Logged in user.');

        if (this.options.loginMethod) {
            const rawLink = await browser.driver.wait(
                until.elementLocated(By.xpath(`//a[text()="${this.options.loginMethod}"]`)), getTimeout(browser.pageLoadTimeout)
            );
            await new Promise((resolve) => setTimeout(resolve, 2500));
            const loginLink = new TheiaElement(rawLink);
            await loginLink.safeClick();
            console.log(`Clicked on login method: "${this.options.loginMethod}".`);
        }
    };
}
