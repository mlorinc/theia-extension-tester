import * as fs from 'fs-extra';
import * as path from 'path';
import { Authenticator } from './authenticator/Authenticator';
import {
    Builder,
    By,
    Capabilities,
    logging,
    until,
    WebDriver,
} from 'selenium-webdriver';
import {
    Options as ChromeOptions
} from 'selenium-webdriver/chrome';
import { TheiaElement } from './page-objects/theia-components/TheiaElement';
import { TheiaLocatorLoader } from './LocatorLoader';
import { ExtestUntil, SeleniumBrowser } from 'extension-tester-page-objects';

export interface ITimeouts {
    implicit?: number;
    pageLoad?: number;
}

export module CheDistribution {
    export const CHE = 'che';
    export const CODEREADY_WORKSPACES = 'codeready';
}

export interface CheBrowserOptions {
    browserName: string;
    distribution: string;
    location?: string;
    logLevel?: logging.Level;
    authenticator?: Authenticator;
    timeouts?: ITimeouts;
}

export class CheBrowser extends SeleniumBrowser {
    private static baseVersion = "1.10.0";
    public static BROWSER_NAME = "Eclipse Che";
    private _name!: string;
    private _driver: WebDriver | undefined;
    private _version!: string;
    private _findElementTimeout: number;
    private _pageLoadTimeout: number;
    private _windowHandle!: string;

    constructor(private options: CheBrowserOptions) {
        super();
        this._name = CheBrowser.BROWSER_NAME;
        this._findElementTimeout = options?.timeouts?.implicit || 0;
        this._pageLoadTimeout = options?.timeouts?.pageLoad || 0;
        SeleniumBrowser.instance = this;
    }

    public get driver(): WebDriver {
        if (this._driver === undefined) {
            throw new Error('WebDriver has not been started.');
        }

        return this._driver;
    }

    public get name(): string {
        return this._name;
    }

    public get storagePath(): string {
        return process.env.TEST_RESOURCES || path.resolve('test-resources');;
    }

    get screenshotsStoragePath(): string {
        return path.join(this.storagePath, 'screenshots');
    }

    public get version(): string {
        return this._version;
    }

    public get findElementTimeout(): number {
        return this._findElementTimeout;
    }

    public set findElementTimeout(value: number) {
        this._findElementTimeout = value;
    }

    
    public get pageLoadTimeout() : number {
        return this._pageLoadTimeout;
    }
    
    
    public set pageLoadTimeout(value : number) {
        this._pageLoadTimeout = value;
    }
    

    public get windowHandle() : string {
        return this._windowHandle;
    }
    

    async start(): Promise<this> {
        const preferences = new logging.Preferences();
        preferences.setLevel(logging.Type.DRIVER, this.options.logLevel || logging.Level.INFO);

        const capabilities = new Capabilities();
        capabilities.set('acceptInsecureCerts', true);

        const chromeOptions = new ChromeOptions();
        const chromeOptionsPath = path.resolve('.', 'test-resources', 'chrome-profile');
        fs.mkdirpSync(chromeOptionsPath);
        chromeOptions.addArguments(`user-data-dir=${chromeOptionsPath}`);


        this._driver = await new Builder()
            .withCapabilities(capabilities)
            .forBrowser(this.options.browserName)
            .setLoggingPrefs(preferences)
            .setChromeOptions(chromeOptions)
            .build();


        await this.driver.manage().window().maximize();

        this._version = CheBrowser.baseVersion;

        const locatorLoader = new TheiaLocatorLoader(
            this.version, CheBrowser.baseVersion, path.join(__dirname, 'locators', this.options.distribution, 'versions'
        ));
        TheiaElement.init(locatorLoader.loadLocators(), this.driver, this.name, this.version);

        fs.mkdirpSync(this.screenshotsStoragePath);

        if (this.options.location) {
            await this.driver.get(this.options.location);

            // focus page instead of search bar
            const html = new TheiaElement(By.css('body'));
            await html.isDisplayed();
            await this.driver.actions().mouseMove(html).doubleClick().perform();

            await this.options?.authenticator?.authenticate();
        }
        else {
            throw new Error('Location detection is not supported.');
        }

        return this;
    }

    async quit(): Promise<void> {
        await this.driver.quit();
    }

    /**
     * Waits until parts of the workbench are loaded
     */
    async waitForWorkbench(timeout?: number): Promise<void> {
        console.log('Loading workbench...');
        timeout = timeout || this.pageLoadTimeout;

        const theiaFrame = await this.driver.wait(until.elementLocated(TheiaElement.locators.widgets.editorFrame.locator), timeout);
        await this.driver.wait(ExtestUntil.elementInteractive(theiaFrame), timeout);
        
        console.log('Loaded workbench.');
        
        this._windowHandle = await this.driver.getWindowHandle();

        // Focus webpage instead search bar
        await this.driver.executeScript('alert("Focus window")');
        await this.driver.switchTo().alert().accept();

        console.log('Attaching to Eclipse Che editor...');
        await this.driver.wait(until.ableToSwitchToFrame(theiaFrame), timeout);
        console.log('Successfully attached to Eclipse Che.');

        try {
            console.log('Waiting for workbench to be ready...');
            await this.driver.wait(until.elementLocated(TheiaElement.locators.widgets.editorLoadedComponent.locator), timeout);
            await this.driver.wait(async () => {
                const chevron = new TheiaElement(TheiaElement.locators.dashboard.cheChevron);
                try {
                    return (await chevron.getLocation()).x < 5;
                }
                catch {
                    return false;
                }
            }, timeout, 'Yellow chevron on top left is not on x = 0.');
            console.log('Workbench is ready.');
        }
        catch (e) {
            throw new Error(`${e} - Could not load Eclipse Che workbench. Increase timeout in browser.waitForWorkbench(timeout?: number).`);
        }
    }
}
