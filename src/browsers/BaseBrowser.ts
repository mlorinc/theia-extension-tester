import * as fs from 'fs-extra';
import * as path from 'path';
import {
    Builder,
    Capabilities,
    CheTheiaBrowser,
    ChromeOptions,
    FirefoxOptions,
    logging,
    OperaOptions,
    SafariOptions,
    SeleniumBrowser,
    TheiaBrowser,
    TheiaElectronBrowser,
    TheiaElement,
    TheiaLocatorLoader,
    until,
    WebDriver
} from '../module';

export interface ITimeouts {
    implicit?: number;
    pageLoad?: number;
}

export enum BrowserDistribution {
    CHE = 'che',
    CODEREADY_WORKSPACES = 'codeready',
    THEIA_ELECTRON = 'theia-electron',
    THEIA_BROWSER = 'theia-browser',
}

export interface BrowserOptions {
    browserLocation?: string;
    cleanSession?: boolean;
    distribution?: BrowserDistribution;
    driverLocation?: string;
    logLevel?: logging.Level;
    timeouts?: ITimeouts;
}

export abstract class BaseBrowser extends SeleniumBrowser {
    private static baseVersion = "1.10.0";
    public static BROWSER_NAME = "Theia";
    private _name!: string;
    private _driver: WebDriver | undefined;
    private _version!: string;
    private _findElementTimeout: number;
    private _pageLoadTimeout: number;
    private _distribution: BrowserDistribution;

    constructor(private browserName: string, private options: BrowserOptions) {
        super();
        this._name = BaseBrowser.BROWSER_NAME;
        this._findElementTimeout = options?.timeouts?.implicit || 0;
        this._pageLoadTimeout = options?.timeouts?.pageLoad || 0;
        this._distribution = options.distribution ?? BrowserDistribution.CHE;
        SeleniumBrowser.instance = this;
    }

    public get driver(): WebDriver {
        if (this._driver === undefined) {
            throw new Error('WebDriver has not been started.');
        }

        return this._driver;
    }

    public get distribution() : string {
        return this._distribution;
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


    public get pageLoadTimeout(): number {
        return this._pageLoadTimeout;
    }


    public set pageLoadTimeout(value: number) {
        this._pageLoadTimeout = value;
    }

    async start(): Promise<this> {
        if (this._driver) {
            return this;
        }

        const browserName = this.browserName;

        const preferences = new logging.Preferences();
        preferences.setLevel(logging.Type.DRIVER, this.options.logLevel || logging.Level.INFO);

        const capabilities = new Capabilities();
        capabilities.set('acceptInsecureCerts', true);

        const chromeOptions = new ChromeOptions();
        const firefoxOptions = new FirefoxOptions();
        const operaOptions = new OperaOptions();
        const safariOptions = new SafariOptions();

        // clear session if allowed
        const browserProfilePath = path.resolve('.', 'test-resources', `${browserName}-profile`);
        if (this.options.cleanSession) {
            safariOptions.setCleanSession(true);
            fs.removeSync(browserProfilePath);
        }
        else {
            safariOptions.setCleanSession(false)
        }

        // create and set browser profile to optimize load time
        fs.mkdirpSync(browserProfilePath);
        chromeOptions.addArguments(`user-data-dir=${browserProfilePath}`);
        firefoxOptions.setProfile(browserProfilePath);
        operaOptions.addArguments(`user-data-dir=${browserProfilePath}`);

        // set custom browser binary
        if (this.options.browserLocation) {
            chromeOptions.setChromeBinaryPath(this.options.browserLocation);
            firefoxOptions.setBinary(this.options.browserLocation);
            operaOptions.setOperaBinaryPath(this.options.browserLocation);

            if (browserName === 'safari') {
                throw new Error('Safari does not support custom binary path.');
            }
        }

        const driverLocation = this.options.driverLocation;
        const pathBackup = process.env.PATH;

        // temporary change PATH variable, so it is possible to use custom WebDriver
        if (driverLocation) {
            process.env.PATH = driverLocation;
        }

        this._driver = await new Builder()
            .withCapabilities(capabilities)
            .forBrowser(browserName)
            .setLoggingPrefs(preferences)
            .setChromeOptions(chromeOptions)
            .setFirefoxOptions(firefoxOptions)
            .setOperaOptions(operaOptions)
            .setSafariOptions(safariOptions)
            .build();

        // restore PATH variable
        if (driverLocation) {
            process.env.PATH = pathBackup;
        }

        await this.driver.manage().window().maximize();

        // Load locators
        this._version = BaseBrowser.baseVersion;

        let locatorFolder = this.distribution;

        if (this.distribution === BrowserDistribution.THEIA_BROWSER || this.distribution === BrowserDistribution.THEIA_ELECTRON) {
            locatorFolder = 'theia';
        }

        const locatorLoader = new TheiaLocatorLoader(
            this.version, BaseBrowser.baseVersion, path.resolve(__dirname, '..', 'locators', locatorFolder, 'versions'
            ));
        TheiaElement.init(locatorLoader.loadLocators(), this.driver, this.name, this.version);

        // create fresh screenshot directory
        fs.removeSync(this.screenshotsStoragePath);
        fs.mkdirpSync(this.screenshotsStoragePath);
        return this;
    }

    async quit(): Promise<void> {
        await this.driver.quit();
        this._driver = undefined;
    }

    /**
     * Waits until parts of the workbench are loaded
     */
    async waitForWorkbench(timeout?: number): Promise<void> {
        timeout = timeout || this.pageLoadTimeout;
        console.log(`Waiting for ${this.constructor.name} workbench...`);
        try {
            const start = Date.now();
            await this.driver.wait(until.elementLocated(TheiaElement.locators.widgets.editorLoadedComponent.locator), timeout);
            console.log(`Loaded workbench in ${Date.now() - start} ms.`);
        }
        catch (e) {
            throw new Error(`${e} - Could not load Eclipse Theia workbench. Increase timeout in browser.waitForWorkbench(timeout?: number).`);
        }
    }
}

export function createBrowser(browserName: string, options: BrowserOptions): BaseBrowser {
    if (options.distribution === BrowserDistribution.CHE || options.distribution === BrowserDistribution.CODEREADY_WORKSPACES) {
        return new CheTheiaBrowser(browserName, options);
    }
    else if (options?.distribution === BrowserDistribution.THEIA_BROWSER) {
        return new TheiaBrowser(browserName, options);
    }
    else {
        return new TheiaElectronBrowser(browserName, options);
    }
}
