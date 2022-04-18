import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import {
    Builder,
    By,
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
import { TheiaLocatorLoader } from './LocatorLoader';
import { TheiaTimeouts, timeout } from '@theia-extension-tester/timeout-manager';


/**
 * Timeouts used when performing operations.
 */
export interface ITimeouts {
    /**
     * Implicit timeout is used when Eclipse Theia / Eclipse Che instance is ready.
     * Before that the page load timeout is used.
     */
    implicit?: number;
    /**
     * Timeout used in initial phases of loading Eclipse Theia / Eclipse Che instance.
     */
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
    /**
     * SeleniumWebdriver log level.
     */
    logLevel?: logging.Level;
    /**
     * Tester timeouts.
     */
    timeouts?: ITimeouts;
    /**
     * Eclipse Theia version under testing.
     */
    version?: string;
}

/**
 * Base browser used as Selenium WebDriver wrapper.
 *
 * Base browser was designed as base class for various Eclipse Theia browser
 * implementations.
 * It is recommended to use specific browser implementations
 * such as [Eclipse Che browser](https://www.npmjs.com/package/@theia-extension-tester/che-browser)
 * or [Eclipse Theia browser](https://www.npmjs.com/package/@theia-extension-tester/theia-browser)
 * depending on what editor is currently tested.
 *
 *
 * @example
 *  // Create new BaseBrowser instance
 *  import { BaseBrowser, BrowserOptions, ITimeouts } from "@theia-extension-tester/base-browser";
 *  import { logging } from 'extension-tester-page-objects';
 *
 *  // It is recommended to use more specific browser mentioned above.
 *  const browser = new BaseBrowser("chrome"), {
 *      // Optional path to browser binary.
 *      // If not specified PATH variable is used.
 *      browserLocation: "/path/to/browser",
 *      // Clean session after window is closed.
 *      cleanSession: true,
 *      // Optional path to Selenium WebDriver binary.
 *      // If not specified PATH variable is used.
 *      driverLocation: "/path/to/webdriver",
 *      // Selenium WebDriver log level.
 *      logLevel: logging.Level.INFO,
 *      // Timeouts used when testing.
 *      timeouts: {
 *          // Timeout after browser is attached
 *          // to Eclipse Theia editor.
 *          implicit: 30000,
 *          // Timeout before browser is attached
 *          // to the editor.
 *          pageLoad: 120000
 *      }
 *  });
 *
 */
export abstract class BaseBrowser extends SeleniumBrowser {
    /**
     * Base version which has every locator defined.
     */
    private static baseVersion = "1.10.0";

    /**
     * Latest supported version.
     */
    private static latestVersion = "1.18.0";

    /**
     * Browser name.
     */
    public static BROWSER_NAME = "Theia";

    private _name!: string;
    private _driver: WebDriver | undefined;
    private _version!: string;

    /**
     *  Eclipse Theia / Eclipse Che distribution. It is there
     *  only for future purposes in case of differences between editors
     *  arise.
     */
    private _distribution: PlatformType;

    /**
     * Timeouts used in testing framework.
     */
    private _timeouts: TheiaTimeouts;

    constructor(private browserName: string, private options: BrowserOptions) {
        super();
        this._name = BaseBrowser.BROWSER_NAME;
        this._distribution = options.distribution ?? 'theia';
        this._version = options.version ?? BaseBrowser.latestVersion;
        SeleniumBrowser.instance = this;
        BaseBrowser.instance = this;
        this._timeouts = {
            findElementTimeout: timeout(options?.timeouts?.implicit || 0),
            defaultTimeout: timeout(() => this.timeouts.findElementTimeout),
            pageLoadTimeout: timeout(options?.timeouts?.pageLoad || 0),
            clearNotificationsThreshold: timeout(500)
        }
    }

    /**
     * Get SeleniumWebDriver instance.
     * @throws Error :: When instance was not created.
     */
    public get driver(): WebDriver {
        if (this._driver === undefined) {
            throw new Error('WebDriver has not been started.');
        }

        return this._driver;
    }

    /**
     * Return Eclipse Theia distribution.
     */
    public get distribution(): PlatformType {
        return this._distribution;
    }

    /**
     * Return browser name. Might be useful when
     * tests are meant to be run on vscode-extension-tester as well
     * but test workflow is different.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Return storage absolute path.
     */
    public get storagePath(): string {
        return process.env.TEST_RESOURCES || path.resolve('test-resources');;
    }

    /**
     * Return screenshots storage absolute path.
     */
    get screenshotsStoragePath(): string {
        return path.join(this.storagePath, 'screenshots');
    }

    /**
     * Return used locator version.
     */
    public get version(): string {
        return this._version;
    }

    /**
     * Get timeouts.
     */
    public get timeouts(): TheiaTimeouts {
        return this._timeouts;
    }

    /**
     * Start new SeleniumWebDriver instance.
     * @returns reference to self
     * @throws error.WebDriverError :: When browser could not be started.
     */
    async start(): Promise<this> {
        // Browser is already running.
        if (this._driver) {
            return this;
        }

        const capabilities = new Capabilities();
        capabilities.set('acceptInsecureCerts', true);

        const preferences = new logging.Preferences();
        preferences.setLevel(logging.Type.DRIVER, this.options.logLevel ?? logging.Level.INFO);

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
        const browserProfilePath = path.join(profileRoot, 'test-resources', `${this.browserName}-profile`);
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

            if (this.browserName === 'safari') {
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
                .forBrowser(this.browserName)
                .setLoggingPrefs(preferences)
                .setChromeOptions(chromeOptions)
                .setFirefoxOptions(firefoxOptions)
                .setOperaOptions(operaOptions)
                .setSafariOptions(safariOptions)
                .build();

            await this.driver.manage().window().maximize();

            // Load locators
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
                this._driver?.quit();
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
     * Waits until parts of the workbench are loaded.
     * @param timeout Timeout in ms.
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

    /**
     * Find elements on web page based on locator and return them as {@link TheiaElement}.
     * @param locator Locator used when searching.
     * @param timeout Timeout in ms.
     * @returns Array of TheiaElements.
     * @throws {@link TimeoutError} :: When timeout runs out.
     */
    static async findElements(locator: Locator, timeout?: number): Promise<TheiaElement[]> {
        const elements = await BaseBrowser.instance.driver.findElements(locator);
        const html = BaseBrowser.instance.driver.findElement(By.css('html'));
        return Promise.all(elements.map((el) => new TheiaElement(el, html, undefined, timeout)));
    }
}
