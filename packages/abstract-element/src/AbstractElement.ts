import {
    Button,
    By,
    Key,
    Locator,
    until,
    WebElement,
    WebElementPromise,
    SeleniumBrowser,
    error
} from 'extension-tester-page-objects';
import { repeat, TimeoutError } from '@theia-extension-tester/repeat';
import { ExtestUntil } from '@theia-extension-tester/until';
import { TimeoutPromise } from '@theia-extension-tester/timeout-promise';

/**
 * Default wrapper for webelement
 */
export abstract class AbstractElement extends WebElement {

    /**
     * CTRL key constant. Platform independent.
     */
    public static ctlKey = process.platform === 'darwin' ? Key.COMMAND : Key.CONTROL;

    /**
     * Loaded page object locators.
     */
    protected static locators: Object;

    /**
     * Parent WebElement. Might be saved as promise.
     */
    protected enclosingItem!: Promise<WebElement> | WebElement;

    /**
     * A ready promise which will be resolved when element with parent are ready to be used.
     */
    protected readyPromise!: Promise<any>;

    /**
     * Timeout to be used when searching for elements and performing other time consuming operations.
     */
    protected timeout: number;

    /**
     * Default find element timeout.
     */
    private static findElementTimeout: number = 0;

    /**
     * Constructs a new element from a Locator or an existing WebElement.
     * @param base WebDriver compatible Locator for the given element or a reference to an existing WebElement
     * @param enclosingItem Locator or a WebElement reference to an element containing the element being constructed. 
     * This will be used to narrow down the search for the underlying DOM element.
     * @param timeout timeout used when looking for elements.
     * @param transformParent transform found parent WebElement into different WebElement (e.g. custom WebElement implementation)
     * this will be used to narrow down the search for the underlying DOM element.
     */
    constructor(base: Locator | WebElement, enclosingItem?: WebElement | Locator,
        timeout?: number, transformParent?: ((transform: WebElement) => WebElement | PromiseLike<WebElement> | AbstractElement)) {
        try {
            const driver = SeleniumBrowser.instance.driver;

            if (base instanceof WebElement) {
                const id = base.getId();
                let parent = AbstractElement.findParent(enclosingItem, timeout);

                if (transformParent) {
                    parent = parent.then(transformParent);
                }

                super(driver, id);
                this.enclosingItem = parent;
                this.readyPromise = Promise.all([id, parent]);
            }
            else {
                const findElementPromise = AbstractElement.findElement(enclosingItem, base, timeout);

                const id = findElementPromise
                    .then(([element, _]) => {
                        return element.getId();
                    })
                    .catch((e) => {
                        e.message = `${e.message}. Called from "${this.constructor.name}".`
                        throw e;
                    })

                super(driver, id);

                let parent = findElementPromise.then(([_, parent]) => parent);
                if (transformParent) {
                    parent = parent.then(transformParent);
                }

                this.enclosingItem = parent;
                this.readyPromise = findElementPromise;
            }
            this.timeout = AbstractElement.getTimeout(timeout);
        }
        catch (e) {
            if (typeof e === 'string') {
                e = new Error(e);
            }

            if (e instanceof Error) {
                e.message = errorHelper(e, base, enclosingItem);
            }
            throw e;
        }
    }

    /**
     * Set default find element timeout.
     * @param value new default timeout.
     */
    public static setDefaultFindElementTimeout(value: number): void {
        AbstractElement.findElementTimeout = value;
    }

    /**
     * Wait until element is ready to be used.
     * @param timeout maximum allowed time to wait.
     * @returns self reference.
     */
    async waitReady(timeout?: number): Promise<this> {
        if (this.readyPromise === undefined) {
            throw new Error('Unexpected error. AbstractElement.readyPromise is undefined.');
        }

        const errorMessage = `${this.constructor.name} is not ready. (Element and its parent has not been located on time)`;

        await TimeoutPromise.createFrom(this.readyPromise, AbstractElement.getTimeout(timeout), {
            id: 'AbstractElement.waitReady',
            message: errorMessage
        });
        return this;
    }

    /**
     * Wait for the element to become visible.
     * @param timeout custom timeout for the wait.
     * @returns self reference.
     */
    async wait(timeout?: number): Promise<this> {
        await this.getDriver().wait(until.elementIsVisible(this), AbstractElement.getTimeout(timeout));
        return this;
    }

    /**
     * Wait for the element to become interactive.
     * @param timeout custom timeout for the interactivity check.
     * @returns self reference.
     */
    async waitInteractive(timeout?: number): Promise<this> {
        await this.getDriver().wait(ExtestUntil.elementInteractive(this), AbstractElement.getTimeout(timeout));
        return this;
    }

    /**
     * Perform click when element is interactive. This methods is also able to deal with intercepted clicks.
     * @param button button to be clicked.
     * @param timeout maximum allowed time to click.
     */
    async safeClick(button: string = Button.LEFT, timeout?: number): Promise<void> {
        await this.getDriver().wait(ExtestUntil.safeClick(this, button), AbstractElement.getTimeout(timeout), `Could not perform safe click(${button}). Enabled: ${await this.isEnabled()}, Visible: ${await this.isDisplayed()}.`);
    }

    /**
     * Perform double click when element is interactive. This methods is also able to deal with intercepted clicks.
     * @param button button to be clicked.
     * @param timeout maximum allowed time to click.
     */
    async safeDoubleClick(button: string = Button.LEFT, timeout?: number): Promise<void> {
        await this.getDriver().wait(this.waitInteractive(timeout), AbstractElement.getTimeout(timeout));
        await this.getDriver().actions().doubleClick(this, button).perform();
    }

    /**
     * Perform send keys when element is interactive. This methods is also able to deal with intercepted clicks.
     * @param timeout maximum allowed time to send keys.
     * @param var_args keys to be sent.
     */
    async safeSendKeys(timeout?: number, ...var_args: (string | number | Promise<string | number>)[]): Promise<void> {
        await this.getDriver().wait(ExtestUntil.safeSendKeys(this, ...var_args), AbstractElement.getTimeout(timeout));
    }

    /**
     * Return a reference to the WebElement containing this element.
     * @returns parent WebElement.
     */
    getEnclosingElement(): WebElement {
        if (this.enclosingItem instanceof WebElement) {
            return this.enclosingItem;
        }

        return new WebElementPromise(this.getDriver(), this.enclosingItem);
    }

    private async findElementHelper(locator: Locator): Promise<WebElement | undefined> {
        try {
            // Call super.findElement but avoid getting into recursion by doing it this way.
            const element = await WebElement.prototype.findElement.call(this, locator);
            return element;
        }
        catch (e) {
            if (e instanceof TimeoutError || e instanceof error.StaleElementReferenceError || e instanceof error.InvalidSelectorError) {
                throw e;
            }

            if (e instanceof error.NoSuchElementError) {
                return undefined;
            }

            console.error(e);
            return undefined;
        }
    }

    findElement(locator: Locator): WebElementPromise {
        const elementPromise = 
            // Wait for element to be ready for use.
            this.waitReady()
            .then(async () => {
                // Repetitively try to find element using locator.
                const element = await repeat(this.findElementHelper.bind(this, locator),
                    {
                        id: 'AbstractElement.findElement(class method)',
                        timeout: AbstractElement.getTimeout(this.timeout),
                        message: `Could not find element with locator "${locator.toString()}" relative to "${this.constructor.name}".`
                    }
                );
                return element;
            });

        return new WebElementPromise(this.getDriver(), elementPromise as Promise<WebElement>);
    }

    async findElements(locator: Locator): Promise<WebElement[]> {
        await this.waitReady();
        return super.findElements(locator);
    }

    /**
     * Store locators for future Abstract Elements.
     * @param locators loaded locators.
     */
    static init(locators: Object) {
        AbstractElement.locators = locators;
    }

    /**
     * Find enclosing element.
     * @param element locator or enclosing WebElement. 
     * @param timeout maximum allowed time.
     * @returns found enclosing WebElement.
     */
    protected static async findParent(element?: WebElement | Locator, timeout?: number): Promise<WebElement> {
        const driver = SeleniumBrowser.instance.driver;
        timeout = AbstractElement.getTimeout(timeout);

        try {
            // If enclosing element is undefined then use html element instead.
            if (element === undefined) {
                if (timeout > 0) {
                    return driver.wait(until.elementLocated(By.css('html')), timeout);
                }
                return driver.findElement(By.css('html'));
            }
            else if (element instanceof WebElement) {
                return element;
            }
            else {
                // If timeout = 0 then use instant find method. Otherwise use repetitive method.
                if (timeout > 0) {
                    return driver.wait(until.elementLocated(element), timeout);
                }
                return driver.findElement(element);
            }
        }
        catch (e) {
            // In case user entered invalid locator then it is not possible to recover.
            if (e instanceof error.InvalidSelectorError && element instanceof By) {
                throw createInvalidLocatorError(element);
            }
            // Unsupported data type was passed. Unrecoverable.
            else if (e instanceof TypeError && e.message.includes('Invalid locator')) {
                throw new TypeError(e.message + ` Element: ${element?.toString()}. Type: ${typeof element}`);
            }
            // Delegate an error to upstream.
            else {
                throw e;
            }
        }
    }

    /**
     * Find element and enclosing element and attempt to recover when an error occurs.
     * @param parent enclosing element to be found.
     * @param base this element to be found.
     * @param timeout maximum allowed time reserver for searching.
     * @returns a tuple of (element, enclosingElement).
     */
    protected static async findElement(parent: Locator | WebElement | undefined, base: Locator, timeout?: number): Promise<Array<WebElement>> {
        // Find enclosing element.
        let parentElement = await AbstractElement.findParent(parent, timeout);
        let repeatTimeout = AbstractElement.getTimeout(timeout);

        try {
            // Attempt to repetitive find the element.
            const element = await repeat(async () => {
                try {
                    const element = await parentElement.findElement(base);
                    return element;
                }
                catch (e) {
                    // The element was not found. Recoverable, try again.
                    if (e instanceof error.NoSuchElementError) {
                        return undefined;
                    }
                    // Enclosing element has become stale. It is possible to recover
                    // if we have parent locator available.
                    else if (e instanceof error.StaleElementReferenceError) {
                        if (parent instanceof WebElement) {
                            throw new Error(`StaleElementReferenceError of parent element. Try using locator.\n${e}`);
                        }
                        parentElement = await AbstractElement.findParent(parent, timeout);
                    }
                    // Invalid locator was passed, nothing to do.
                    else if (e instanceof error.InvalidSelectorError) {
                        throw createInvalidLocatorError(base);
                    }
                    // Unknown error.
                    else {
                        throw e;
                    }
                }
            }, {
                timeout: repeatTimeout,
                id: 'AbstractElement.findElement',
                message: errorHelper('Could not find element', base, parentElement)
            }) as WebElement;
            return Promise.all([element, parentElement]);
        }
        catch (e) {
            if (e instanceof TimeoutError && parent instanceof AbstractElement) {
                const status = await parent.waitReady(0).then(() => 'ready').catch(() => 'not ready');
                e.appendMessage(`Element was ${status}.`);
            }
            throw e;
        }
    }

    protected static getTimeout(value?: number): number {
        return value !== undefined ? value : AbstractElement.findElementTimeout;
    }
}

function createInvalidLocatorError(locator: Locator): Error {
    return new Error(`Invalid locator: toString(${locator.toString()}), class(${locator?.constructor?.name}), keys(${Object.keys(locator).join(', ')}}).`);
}

function errorHelper(e: Error | string, base: WebElement | Locator, enclosingItem: WebElement | Locator | undefined): string {
    const message = e instanceof Error ? e.message : e;
    let baseMessage: string;
    let enclosingItemMessage: string;

    if (base instanceof WebElement) {
        baseMessage = `Base element is represented by "${base.constructor.name}" class.`;
    }
    else if (base instanceof By) {
        baseMessage = `Base element is using locator: ${base.toString()}`;
    }
    else if (base instanceof Function) {
        baseMessage = `Base element is searched by function "${base.name}".`;
    }
    else {
        baseMessage = `Base element is represented by unknown "${typeof (base)}".`;
    }

    if (enclosingItem instanceof WebElement) {
        enclosingItemMessage = `Parent element is represented by "${enclosingItem.constructor.name}" class.`;
    }
    else if (enclosingItem instanceof By) {
        enclosingItemMessage = `Parent element is using locator: ${enclosingItem.toString()}`;
    }
    else if (enclosingItem instanceof Function) {
        enclosingItemMessage = `Parent element is searched by function "${enclosingItem.name}".`;
    }
    else {
        enclosingItemMessage = `Parent element is represented by unknown "${typeof (enclosingItem)}".`;
    }

    return `${message}\n${baseMessage}\n${enclosingItemMessage}`;
}
