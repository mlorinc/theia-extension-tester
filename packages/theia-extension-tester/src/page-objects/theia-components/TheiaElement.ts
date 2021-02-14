import { AbstractElement, SeleniumBrowser } from 'extension-tester-page-objects';
import {
    Locator,
    WebDriver,
    WebElement,
    WebElementPromise
} from 'selenium-webdriver';
import { isTheiaLocator, TheiaLocator, TheiaLocators } from '../../locators/TheiaLocators';

export class TheiaElement extends AbstractElement {
    protected static _locators: TheiaLocators;
    private _theiaLocator?: TheiaLocator;

    constructor(base: Locator | WebElement | TheiaLocator, enclosingItem?: WebElement | Locator | TheiaLocator) {
        const baseLocator = TheiaElement.handleLocator(base);
        const parentLocator = enclosingItem ? TheiaElement.handleLocator(enclosingItem) : enclosingItem;
        super(baseLocator, parentLocator);

        if (isTheiaLocator(base)) {
            this._theiaLocator = base as TheiaLocator;
        }
    }

    get theiaLocator() : TheiaLocator | undefined {
        return this._theiaLocator; 
    }
    
    async click(timeout?: number): Promise<void> {
        return super.click(timeout || await SeleniumBrowser.instance.getImplicitTimeout());
    }

    async waitInteractive(timeout?: number): Promise<this> {
        try {
            return super.waitInteractive(timeout || await SeleniumBrowser.instance.getImplicitTimeout());
        }
        catch (e) {
            if (this.theiaLocator) {
                const locator = this.theiaLocator.locator.toString();
                const clazz = this.theiaLocator.class?.constructor || 'Unknown';
                const dependencyLocator = this.theiaLocator.dependency?.call(undefined, TheiaElement.locators);
                const dependsOn = dependencyLocator?.class?.constructor || dependencyLocator?.locator.toString() || 'Unknown';

                throw new Error(`${e}\nLocator: ${locator}, Class: ${clazz}, Depends on: ${dependsOn}`);
            }
            else {
                throw e;
            }
        }
    }

    static get locators(): TheiaLocators {
        return this._locators;
    }

    private static handleLocator(base: WebElement | Locator | TheiaLocator): Locator | WebElement {
        if (isTheiaLocator(base)) {
            const theiaLocator = base as TheiaLocator;
            return theiaLocator.locator;
        }
        else {
            return base;
        }
    }

    findElement(locator: Locator | TheiaLocator): WebElementPromise {
        const element = super.findElement(TheiaElement.handleLocator(locator) as Locator)
            .then((element) => new TheiaElement(element, this));
        return new WebElementPromise(this.getDriver(), element as Promise<TheiaElement>);
    }

    async findElements(locator: Locator | TheiaLocator): Promise<WebElement[]> {
        const elements = await super.findElements(TheiaElement.handleLocator(locator) as Locator);
        return elements.map((element) => new TheiaElement(element, this));
    }

    static init(locators: TheiaLocators, driver: WebDriver, browser: string, version: string) {
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
