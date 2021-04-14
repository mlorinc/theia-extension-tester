import {
    AbstractElement,
    getTimeout,
    isTheiaLocator,
    Locator,
    SeleniumBrowser,
    TheiaLocator,
    TheiaLocatorProperties,
    TheiaLocatorProperty,
    TheiaLocators,
    WebDriver,
    WebElement,
    WebElementPromise
} from '../../module';

export class TheiaElement extends AbstractElement {
    protected static _locators: TheiaLocators;
    private _theiaLocator?: TheiaLocator;
    protected properties?: TheiaLocatorProperties;

    constructor(base: Locator | WebElement | TheiaLocator, enclosingItem?: Locator | WebElement | TheiaLocator, baseTheiaLocator?: TheiaLocator) {
        const baseLocator = TheiaElement.handleLocator(base);
        const parentLocator = TheiaElement.handleLocator(enclosingItem);

        if (baseLocator !== undefined) {
            super(baseLocator, parentLocator);
        }
        else {
            throw new Error('Base locator must not be undefined.');
        }

        if (base instanceof TheiaElement) {
            this._theiaLocator = base.theiaLocator;
        }
        else if (baseTheiaLocator) {
            this._theiaLocator = baseTheiaLocator;
        }
        else if (isTheiaLocator(base)) {
            this._theiaLocator = base as TheiaLocator;
        }
    }

    get theiaLocator(): TheiaLocator | undefined {
        return this._theiaLocator;
    }

    static get locators(): TheiaLocators {
        return this._locators;
    }

    private static handleLocator(base?: WebElement | Locator | TheiaLocator): Locator | WebElement | undefined {
        if (isTheiaLocator(base)) {
            const theiaLocator = base as TheiaLocator;
            return theiaLocator.locator;
        }
        else {
            return base;
        }
    }

    findElement(locator: Locator | TheiaLocator): WebElementPromise {
        const baseLocator = TheiaElement.handleLocator(locator) as Locator;
        const loc: TheiaLocator | undefined = isTheiaLocator(locator) ? (locator as TheiaLocator) : undefined;
        const element = this.getDriver()
            .wait(
                () => super.findElement(baseLocator).catch(() => undefined), SeleniumBrowser.instance.findElementTimeout,
                `Could not find element with locator "${baseLocator.toString()}" relative to "${this.constructor.name}".`
            )
            .then((element) => new TheiaElement(element as WebElement, this, loc))

        return new WebElementPromise(this.getDriver(), element as Promise<TheiaElement>);
    }

    async findElements(locator: Locator | TheiaLocator): Promise<WebElement[]> {
        const elements = await super.findElements(TheiaElement.handleLocator(locator) as Locator);
        const loc: TheiaLocator | undefined = isTheiaLocator(locator) ? (locator as TheiaLocator) : undefined;
        return elements.map((element) => new TheiaElement(element, this, loc));
    }

    async focus(): Promise<void> {
        await this.getDriver().executeScript('arguments[0].focus()', this);
    }

    async getProperty(property: TheiaLocatorProperty): Promise<string | number | boolean> {
        if (this.theiaLocator) {
            if (this.theiaLocator.properties) {
                const fn = this.theiaLocator.properties[property];
                if (fn) {
                    await this.getDriver().wait(() => this.getEnclosingElement(), getTimeout(), 'Waiting for enclosing element to load.');
                    const value = await fn(this, TheiaElement.locators);
                    return value;
                }
                else {
                    throw new Error(`${this.constructor.name} does not have defined "${property}" property in locators file.`);
                }
            }
            else {
                throw new Error(`${this.constructor.name} does not have defined properties in locators file.`);
            }
        }
        else {
            throw new Error(`Cannot use TheiaElement.getProperty on elements not initialized with TheiaLocator or TheiaElement. Called from ${this.constructor.name}.`);
        }
    }

    hasProperty(property: TheiaLocatorProperty): boolean {
        if (this.theiaLocator) {
            return this.theiaLocator.properties !== undefined && this.theiaLocator.properties[property] !== undefined;
        }
        else {
            return false;
        }
    }

    async isCollapsed(): Promise<boolean> {
        if (this.hasProperty('collapsed')) {
            return await this.getProperty('collapsed') as boolean;
        }
        throw new Error(`${this.constructor.name} does not have collapsed property.`);
    }

    async isDirty(): Promise<boolean> {
        if (this.hasProperty('dirty')) {
            return await this.getProperty('dirty') as boolean;
        }
        throw new Error(`${this.constructor.name} does not have dirty property.`);
    }

    async isExpandable(): Promise<boolean> {
        if (this.hasProperty('expandable')) {
            return await this.getProperty('expandable') as boolean;
        }
        throw new Error(`${this.constructor.name} does not have expandable property.`);
    }

    async isFocused(): Promise<boolean> {
        if (this.hasProperty('focused')) {
            return await this.getProperty('focused') as boolean;
        }
        throw new Error(`${this.constructor.name} does not have focused property.`);
    }

    async getIndex(): Promise<number> {
        if (this.hasProperty('index')) {
            return await this.getProperty('index') as number;
        }
        throw new Error(`${this.constructor.name} does not have index property.`);
    }

    async isMain(): Promise<boolean> {
        if (this.hasProperty('main')) {
            return await this.getProperty('main') as boolean;
        }
        throw new Error(`${this.constructor.name} does not have main property.`);
    }

    async isSecondary(): Promise<boolean> {
        if (this.hasProperty('secondary')) {
            return await this.getProperty('secondary') as boolean;
        }
        throw new Error(`${this.constructor.name} does not have secondary property.`);
    }

    async isSelected(): Promise<boolean> {
        if (this.hasProperty('selected')) {
            return await this.getProperty('selected') as boolean;
        }
        return await super.isSelected();
    }

    async getTitle(): Promise<string> {
        if (this.hasProperty('title')) {
            return await this.getProperty('title') as string;
        }
        throw new Error(`${this.constructor.name} does not have title.`);
    }

    async isEnabled(): Promise<boolean> {
        if (this.hasProperty('enabled')) {
            return await this.getProperty('enabled') as boolean;
        }
        else {
            return await super.isEnabled();
        }
    }

    async getComputedStyle(property: string): Promise<unknown> {
        return await this.getDriver().executeScript(`getComputedStyle(arguments[0]).${property}`, this);
    }

    async getComputedStyleNumber(property: string): Promise<number> {
        const value = await this.getComputedStyle(property);

        if (value) {
            if (typeof value === 'string') {
                const parsedValue = Number.parseInt(value);

                if (Number.isNaN(parsedValue)) {
                    console.warn(`Value "${value}" was parsed to NaN.`);
                    return 0;
                }
                return parsedValue;
            }
            else {
                throw new Error(`Unknown type to parse: ${typeof value}.`);
            }
        }
        else {
            return 0;
        }
    };

    static init(locators: TheiaLocators, driver: WebDriver, browser: string, version: string) {
        if (locators === undefined) {
            throw new Error('Could not load locators.');
        }

        TheiaElement._locators = locators;
        AbstractElement.driver = driver;
        AbstractElement.versionInfo = { version: version, browser: browser };
    }

    static async find<T>(elements: T[], predictor: (item: T) => boolean | PromiseLike<boolean>): Promise<T> {
        for (const element of elements) {
            if (await predictor(element)) {
                return element;
            }
        }
        throw new Error('Could find element');
    }
}
