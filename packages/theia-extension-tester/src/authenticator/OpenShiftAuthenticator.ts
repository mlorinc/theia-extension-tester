import { By } from "selenium-webdriver";
import { CheBrowser, CheBrowserOptionsCredentials } from "../browser";
import { Authenticator } from "./Authenticator";

export class OpenShiftAuthenticator implements Authenticator {
    constructor(private implicitTimeout: number = 30000) { }

    async authenticate(browser: CheBrowser, credentials: CheBrowserOptionsCredentials): Promise<void> {
        const timeout = await browser.getImplicitTimeout();
        await browser.setImplicitTimeout(this.implicitTimeout);

        const loginLink = await browser.driver.findElement(By.xpath('//a[text()="htpasswd_provider"]'));
        await loginLink.click();

        const form = await browser.driver.findElement(By.xpath('//form'));
        const usernameInput = await browser.driver.findElement(By.name('username'));
        const passwordInput = await browser.driver.findElement(By.name('password'));
        const submitButton = await form.findElement(By.xpath('.//button[@type="submit"]'));

        await usernameInput.sendKeys(credentials.login);
        await passwordInput.sendKeys(credentials.password);
        await submitButton.click();
        await browser.setImplicitTimeout(timeout);
    };
}
