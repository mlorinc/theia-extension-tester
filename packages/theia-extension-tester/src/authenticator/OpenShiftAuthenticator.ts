import { By } from "selenium-webdriver";
import { CheBrowserOptionsCredentials } from "../browser";
import { TheiaElement } from "../page-objects/theia-components/TheiaElement";
import { Authenticator } from "./Authenticator";

export class OpenShiftAuthenticator implements Authenticator {
    constructor(private timeout: number = 15000) { }

    async authenticate(credentials: CheBrowserOptionsCredentials): Promise<void> {
        const loginLink = new TheiaElement(By.xpath('//a[text()="htpasswd_provider"]'));
        await loginLink.safeClick();

        const form = new TheiaElement(By.css('form'));
        const usernameInput = await form.findElement(By.name('username')) as TheiaElement;
        const passwordInput = await form.findElement(By.name('password')) as TheiaElement;
        const submitButton = await form.findElement(By.xpath('.//button[@type="submit"]')) as TheiaElement;

        await usernameInput.safeSendKeys(this.timeout, credentials.login);
        await passwordInput.safeSendKeys(this.timeout, credentials.password);
        await submitButton.safeClick(undefined, this.timeout);
    };
}
