import * as fs from 'fs-extra';
import * as path from 'path';
import { Authenticator } from './authenticator/Authenticator';
import {
    Builder,
    By,
    Capabilities,
    logging,
    WebDriver
} from 'selenium-webdriver';
import { TheiaElement } from './page-objects/theia-components/TheiaElement';
import { TheiaLocatorLoader } from './LocatorLoader';
import { SeleniumBrowser } from 'extension-tester-page-objects';

export interface CheBrowserOptionsCredentials {
    login: string;
    password: string;
}

export interface ITimeouts {
    implicit?: number;
    pageLoad?: number;
}

export interface CheBrowserOptions {
    browserName: string;
    location?: string;
    logLevel?: logging.Level;
    credentials: CheBrowserOptionsCredentials;
    authenticator?: Authenticator;
    timeouts?: ITimeouts;
}

export class CheBrowser extends SeleniumBrowser {
    private static baseVersion = "1.10.0";
    public static BROWSER_NAME = "Eclipse Che";
    private _name!: string;
    private _driver!: WebDriver;
    private _version!: string;
    private _implicitTimeout!: number;

    constructor(private options: CheBrowserOptions) {
        super();
        this._name = CheBrowser.BROWSER_NAME;
        this._implicitTimeout = options?.timeouts?.implicit || 0;
        SeleniumBrowser.instance = this;
    }

    public get driver(): WebDriver {
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

    async getImplicitTimeout(): Promise<number> {
        return this._implicitTimeout;
    }

    async setImplicitTimeout(value: number): Promise<void> {
        this._implicitTimeout = value;
        await this.driver.manage().timeouts().implicitlyWait(value);
    }

    async start(): Promise<this> {
        const preferences = new logging.Preferences();
        preferences.setLevel(logging.Type.DRIVER, this.options.logLevel || logging.Level.INFO);

        const capabilities = new Capabilities();
        capabilities.set('acceptInsecureCerts', true);

        this._driver = await new Builder()
            .withCapabilities(capabilities)
            .forBrowser(this.options.browserName)
            .setLoggingPrefs(preferences)
            .build();

        if (this.options.timeouts) {
            await this.driver.manage().timeouts().implicitlyWait(this.options.timeouts.implicit || 0);
            await this.driver.manage().timeouts().pageLoadTimeout(this.options.timeouts.pageLoad || -1);
        }

        await this.driver.manage().window().maximize();

        this._version = CheBrowser.baseVersion;

        const locatorLoader = new TheiaLocatorLoader(this.version, CheBrowser.baseVersion, path.join(__dirname, 'locators', 'versions'));
        TheiaElement.init(locatorLoader.loadLocators(), this.driver, this.name, this.version);

        fs.mkdirpSync(this.screenshotsStoragePath);

        if (this.options.location) {
            await this.driver.get(this.options.location);
            await this.options?.authenticator?.authenticate(this, this.options.credentials);
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
        const timeoutBackup = await SeleniumBrowser.instance.getImplicitTimeout();
        await SeleniumBrowser.instance.setImplicitTimeout(timeout || timeoutBackup || 30000);

        const theiaFrame = await this.driver.findElement(By.id('ide-iframe'));
        await this.driver.wait(async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 5000));
                await this.driver.switchTo().frame(theiaFrame);
                return true
            } catch {
                return false;
            }
        }, timeout);

        try {
            await this.driver.findElement(By.id('theia-left-right-split-panel'));
            await SeleniumBrowser.instance.setImplicitTimeout(timeoutBackup);
        }
        catch (e) {
            throw new Error(`${e} - Could not load Eclipse Che workbench. Increase timeout in browser.waitForWorkbench(timeout?: number).`);
        }
    }
}
