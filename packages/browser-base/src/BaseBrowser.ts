import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import {
    Builder,
    Capabilities,
    chrome,
    error,
    firefox,
    Locator,
    logging,
    opera,
    safari,
    SeleniumBrowser,
    until,
    WebDriver
} from 'extension-tester-page-objects';
import { getLocatorsPath, PlatformType, TheiaElement } from '@theia-extension-tester/theia-element';
import { TheiaLocatorLoader } from '@theia-extension-tester/locator-loader';
import { TheiaTimeouts, timeout } from '@theia-extension-tester/timeout-manager';



export interface ITimeouts {
    implicit?: number;
    pageLoad?: number;
}

export interface BrowserOptions {
    /**
     * Browser binary location.
     */
    browserLocation?: string;
    /**
     * Start browser with clean session.
     */
    cleanSession?: boolean;
    /**
     * Theia distribution.
     */
    distribution?: PlatformType;
    /**
     * Path to driver locations. Path must be absolute.
     */
    driverLocation?: string;
    logLevel?: logging.Level;
    /**
     * Tester timeouts.
     */
    timeouts?: ITimeouts;
}

export abstract class BaseBrowser extends SeleniumBrowser {
    private static baseVersion = "1.10.0";
    private static latestVersion = "1.16.0";
    public static BROWSER_NAME = "Theia";
    private _name!: string;
    private _driver: WebDriver | undefined;
    private _version!: string;
    private _distribution: PlatformType;
    private _timeouts: TheiaTimeouts;

    constructor(private browserName: string, private options: BrowserOptions) {
        super();
        this._name = BaseBrowser.BROWSER_NAME;
        this._distribution = options.distribution ?? 'che';
        SeleniumBrowser.instance = this;
        BaseBrowser.instance = this;
        this._timeouts = {
            findElementTimeout: timeout(options?.timeouts?.implicit || 0),
            defaultTimeout: timeout(() => this.timeouts.findElementTimeout),
            pageLoadTimeout: timeout(options?.timeouts?.pageLoad || 0)
        }
    }

    public get driver(): WebDriver {
        if (this._driver === undefined) {
            throw new Error('WebDriver has not been started.');
        }

        return this._driver;
    }

    public get distribution(): PlatformType {
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

    public get timeouts(): TheiaTimeouts {
        return this._timeouts;
    }

    async start(): Promise<this> {
        if (this._driver) {
            return this;
        }

        const browserName = this.browserName;

        const capabilities = new Capabilities();
        capabilities.set('acceptInsecureCerts', true);

        const preferences = new logging.Preferences();
        preferences.setLevel(logging.Type.DRIVER, this.options.logLevel || logging.Level.INFO);

        const chromeOptions = new chrome.Options();
        const firefoxOptions = new firefox.Options();
        const operaOptions = new opera.Options();
        const safariOptions = new safari.Options();

        chromeOptions.setLoggingPrefs(preferences);
        firefoxOptions.setLoggingPreferences(preferences);
        operaOptions.setLoggingPrefs(preferences);
        safariOptions.setLoggingPrefs(preferences);

        const profileRoot = process.env['SELENIUM_REMOTE_URL'] ? os.tmpdir() : process.cwd();

        // clear session if allowed
        const browserProfilePath = path.join(profileRoot, 'test-resources', `${browserName}-profile`);
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

        try {
            // change PATH variable, so it is possible to use custom WebDriver
            if (driverLocation) {
                if (fs.statSync(driverLocation).isDirectory()) {
                    process.env.PATH = [driverLocation, process.env.PATH].join(path.delimiter);
                }
                else {
                    process.env.PATH = [path.dirname(driverLocation), process.env.PATH].join(path.delimiter);
                }
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

            await this.driver.manage().window().maximize();

            // Load locators
            this._version = BaseBrowser.latestVersion;

            const locatorLoader = new TheiaLocatorLoader(
                this.version, BaseBrowser.baseVersion, getLocatorsPath(this.distribution)
            );

            TheiaElement.initTheiaElement(locatorLoader.loadLocators(), () => this.timeouts);

            // create fresh screenshot directory
            fs.removeSync(this.screenshotsStoragePath);
            fs.mkdirpSync(this.screenshotsStoragePath);

        }
        catch (e) {
            if (e instanceof error.WebDriverError) {
                this._driver?.quit()
                throw e;
            }
        }
        finally {
            // restore PATH variable
            if (driverLocation) {
                process.env.PATH = pathBackup;
            }
        }

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
        timeout = this.timeouts.pageLoadTimeout(timeout);
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

    static async findElements(locator: Locator, timeout?: number): Promise<TheiaElement[]> {
        const elements = await BaseBrowser.instance.driver.findElements(locator);
        return Promise.all(elements.map((el) => new TheiaElement(el, undefined, undefined, timeout)));
    }
}
