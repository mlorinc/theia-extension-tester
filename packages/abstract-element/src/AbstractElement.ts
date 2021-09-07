import {
    Button,
    By,
    Key,
    Locator,
    until,
    WebElement,
    WebElementPromise,
    SeleniumBrowser
} from 'extension-tester-page-objects';
import { repeat } from '@theia-extension-tester/repeat';
import { ExtestUntil } from '@theia-extension-tester/until';

/**
 * Default wrapper for webelement
 */
export abstract class AbstractElement extends WebElement {

    public static ctlKey = process.platform === 'darwin' ? Key.COMMAND : Key.CONTROL;
    protected static locators: Object;
    protected enclosingItem!: WebElement;
    private static findElementTimeout: number = 0;

    /**
     * Constructs a new element from a Locator or an existing WebElement
     * @param base WebDriver compatible Locator for the given element or a reference to an existing WebElement
     * @param enclosingItem Locator or a WebElement reference to an element containing the element being constructed
     * @param timeout timeout used when looking for elements
     * this will be used to narrow down the search for the underlying DOM element
     */
    constructor(base: Locator | WebElement, enclosingItem?: WebElement | Locator, timeout?: number) {
        try {
            if (base instanceof WebElement) {
                super(SeleniumBrowser.instance.driver, base.getId());
                this.enclosingItem = AbstractElement.findParent(enclosingItem, timeout);
            }
            else {
                const findElementPromise = AbstractElement.findElement(enclosingItem, base, timeout);
                const id = findElementPromise
                    .then(([id, _]) => {
                        return id;
                    })
                    .catch((e) => {
                        e.message = `${e.message}. Called from "${this.constructor.name}".`
                        throw e;
                    })

                super(
                    SeleniumBrowser.instance.driver,
                    id
                );
                this.enclosingItem = new WebElementPromise(SeleniumBrowser.instance.driver, findElementPromise.then(([_, parent]) => parent));
            }
        }
        catch (e) {
            e.message = errorHelper(e, base, enclosingItem);
            throw e;
        }
    }

    public static setDefaultFindElementTimeout(value: number): void {
        AbstractElement.findElementTimeout = value;
    }

    /**
     * Wait for the element to become visible
     * @param timeout custom timeout for the wait
     * @returns thenable self reference
     */
    async wait(timeout?: number): Promise<this> {
        await this.getDriver().wait(until.elementIsVisible(this), AbstractElement.getTimeout(timeout));
        return this;
    }

    async safeClick(button: string = Button.LEFT, timeout?: number): Promise<void> {
        await this.getDriver().wait(ExtestUntil.safeClick(this, button), AbstractElement.getTimeout(timeout), `Could not perform safe click(${button}). Enabled: ${await this.isEnabled()}, Visible: ${await this.isDisplayed()}.`);
    }

    async safeDoubleClick(button: string = Button.LEFT, timeout?: number): Promise<void> {
        await this.getDriver().wait(ExtestUntil.elementInteractive(this), AbstractElement.getTimeout(timeout));
        await this.getDriver().actions().doubleClick(this, button).perform();
    }

    async safeSendKeys(timeout?: number, ...var_args: (string | number | Promise<string | number>)[]): Promise<void> {
        await this.getDriver().wait(ExtestUntil.safeSendKeys(this, ...var_args), AbstractElement.getTimeout(timeout));
    }

    /**
     * Return a reference to the WebElement containing this element
     */
    getEnclosingElement(): WebElement {
        return this.enclosingItem;
    }

    static init(locators: Object) {
        AbstractElement.locators = locators;
    }

    protected static findParent(element?: WebElement | Locator, timeout?: number): WebElement | WebElementPromise {
        const driver = SeleniumBrowser.instance.driver;
        timeout = AbstractElement.getTimeout(timeout);

        if (element == null) {
            if (timeout > 0) {
                return driver.wait(until.elementLocated(By.css('html')), timeout);
            }
            return driver.findElement(By.css('html'));
        }
        else if (element instanceof WebElement || element instanceof WebElementPromise) {
            return element;
        }
        else {
            if (timeout > 0) {
                return driver.wait(until.elementLocated(element), timeout);
            }
            return driver.findElement(element);
        }
    }
    
    protected static async findElement(parent: Locator | WebElement | undefined, base: Locator, timeout?: number): Promise<[string, WebElement]> {
        let parentElement = await AbstractElement.findParent(parent, timeout);
        let repeatTimeout = AbstractElement.getTimeout(timeout);
    
        const element = await repeat(async () => {
            try {
                return await parentElement.findElement(base);
            }
            catch (e) {
                if (e.name === 'StaleElementReferenceError') {
                    if (parent instanceof WebElement) {
                        throw new Error(`StaleElementReferenceError of parent element. Try using locator.\n${e}`);
                    }
                    parentElement = await AbstractElement.findParent(parent, timeout);
                }
    
                if (e.message.includes('Invalid locator')) {
                    throw new Error(`Invalid locator: toString(${base.toString()}), class(${base?.constructor?.name}), keys(${Object.keys(base).join(', ')}}).`);
                }
                return undefined;
            }
        }, {
            timeout: repeatTimeout,
            id: 'AbstractElement.findElement',
            message: errorHelper('Could not find element', base, parentElement)
        });
        return [await element!.getId(), parentElement];
    }

    protected static getTimeout(value?: number): number {
        return value !== undefined ? value : AbstractElement.findElementTimeout;
    }
}


function errorHelper(e: Error | string, base: WebElement | Locator, enclosingItem: WebElement | Locator | undefined): string {
    const message = e instanceof Error ? e.message : e;
    const baseMessage = base?.constructor?.name || `WebElement: ${base instanceof WebElement}`;
    const parentMessage = enclosingItem?.constructor?.name || `WebElement: ${enclosingItem instanceof WebElement}, undefined: ${enclosingItem === undefined}`;
    return `${message}: Base locator: ${baseMessage}, Parent locator: ${parentMessage}`;
}
