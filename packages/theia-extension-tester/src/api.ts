import * as fs from 'fs-extra';
import * as path from 'path';
import {
    AUTHENTICATION_OPTION,
    BaseOptions,
    BaseStrictOptions,
    BROWSER_OPTION,
    CHE_DEFAULT_OPTIONS,
    CheOptions,
    CheStrictOptions,
    CLEAN_OPTION,
    COPY_FILES_OPTION,
    DEVFILE_ARGUMENT,
    DEVFILE_ATTRIBUTES_OPTIONS,
    DRIVER_OPTION,
    ENV_OPTION,
    FOLDER_OPTION,
    isAuthenticationOptionSupported,
    LOG_OPTION,
    MOCHA_OPTION,
    QUERY_OPTION,
    StringDictionary,
    TESTS_ARGUMENT,
    THEIA_DEFAULT_OPTIONS,
    TheiaOptions,
    TheiaStrictOptions,
    URL_OPTION
} from './options';
import { BaseBrowser, BrowserOptions, ITimeouts } from '@theia-extension-tester/base-browser';
import {
    CheTheiaBrowser,
    CheTheiaFactoryRunner,
    OpenShiftAuthenticator,
    TheiaBrowser,
    TheiaBrowserRunner
} from './';
import { config } from 'dotenv';
import { getBrowserLocation, getBrowserName, parseObjectJsonArgument } from './parser';
import { AdapterModuleNotFound, theia } from '@theia-extension-tester/adapters';

/**
 * List of supported truthy strings.
 */
const TRUE_STRINGS = ['true', '1', 'yes', 'y'];

/**
 * List of supported false strings.
 */
const FALSE_STRINGS = ['false', '0', 'no', 'n'];

/**
 * Abstract class for every theia-extension-tester launcher.
 * The class have 2 generic types. The first one is for object
 * created by user. The object might contain undefined values
 * because some values may be replaced by default values.
 * 
 * The second type is for object handled by ExTester object author
 * in function {@link ExTester.getBackendOptions}. This object
 * is supposed to be clean of user errors and default values
 * should be in place in case of undefined values.
 */
abstract class ExTester<T extends BaseOptions, V extends BaseStrictOptions> {
    /**
     * Options given by user
     */
    private _frontendOptions: T;

    /**
     * Sanitized options by ExTester Author
     */
    private _backendOptions: V;

    /**
     * Create new ExTester object given user options and default options.
     * @param options options provided by user
     * @param defaultOptions default options to replace undefined values to any {@link options} attribute
     */
    constructor(options: T, defaultOptions: V) {
        this._frontendOptions = options ?? {};
        this._backendOptions = this.getBackendOptions(defaultOptions);
    }

    /**
     * Launch tests. On successful testing 0 is returned.
     */
    abstract runTests(): Promise<number>;

    /**
     * Options given by user
     */
    public get frontendOptions(): T {
        return this._frontendOptions;
    }

    /**
     * Sanitized options by ExTester Author
     */
    public get backendOptions(): V {
        return this._backendOptions;
    }

    /**
     * Replace undefined attributes by default options attributes.
     * @param defaultOptions default options to be used in replacement
     * @returns sanitized options
     */
    private getBackendOptions(defaultOptions: V): V {
        const options = this._frontendOptions as any;
        let output: any = { ...options };
        for (const key of Object.keys(defaultOptions)) {
            output[key] = options[key] !== undefined ? options[key] : (defaultOptions as any)[key];
        }

        return output;
    }
}

/**
 * ExTester implementation for Theia editor.
 */
export class TheiaExTester extends ExTester<TheiaOptions, TheiaStrictOptions> {

    /**
     * Construct new object using theia options.
     * @param options {@link TheiaOptions} provided by user.
     */
    constructor(options: TheiaOptions) {
        super(options, THEIA_DEFAULT_OPTIONS);
    }

    /**
     * Run tests on Theia editor.
     * @returns 0 if successful or any number otherwise
     */
    async runTests(): Promise<number> {
        // apply theia adapter just in case if tests are using vscode-extension-tester
        theia();
        const browser = await createBrowser(this.backendOptions, TheiaBrowser);

        let folder = this.backendOptions[FOLDER_OPTION];
        let filesToCopy = this.backendOptions[COPY_FILES_OPTION];

        if (filesToCopy !== undefined) {
            if (folder === undefined) {
                throw new Error(`Cannot use --${COPY_FILES_OPTION} without --${FOLDER_OPTION}.`)
            }

            await prepareWorkspace(folder);
            for (const file of filesToCopy) {
                await copyFile(file, path.join(folder, path.basename(file)));
            }
        }

        const runner = new TheiaBrowserRunner(browser, {
            theiaUrl: this.backendOptions[URL_OPTION],
            openFolder: folder,
            mochaOptions: parseObjectJsonArgument<Mocha.MochaOptions>({
                object: this.backendOptions[MOCHA_OPTION],
                optional: true,
                name: MOCHA_OPTION
            }),
            query: parseObjectJsonArgument({
                object: this.backendOptions[QUERY_OPTION],
                optional: true,
                name: QUERY_OPTION,
            })
        });

        return await runner.runTests(this.backendOptions[TESTS_ARGUMENT]);
    }
}

/**
 * ExTester implementation for Che-Theia editor.
 */
export class CheExTester extends ExTester<CheOptions, CheStrictOptions> {
    constructor(options: CheOptions) {
        super(options, CHE_DEFAULT_OPTIONS);
    }

    /**
     * Run tests on Che editor.
     * @returns 0 if successful or any number otherwise
     */
    async runTests(): Promise<number> {
        try {
            // apply theia adapter just in case if tests are using vscode-extension-tester
            theia();
        }
        catch (e) {
            if (!(e instanceof AdapterModuleNotFound)) {
                throw e;
            }
        }

        if (this.backendOptions[ENV_OPTION]) {
            config({
                path: this.backendOptions[ENV_OPTION]
            });
        }

        const browser = await createBrowser(this.backendOptions, CheTheiaBrowser);
        const runner = new CheTheiaFactoryRunner(browser, {
            cheUrl: this.backendOptions[URL_OPTION],
            factoryUrl: this.backendOptions[DEVFILE_ARGUMENT],
            mochaOptions: parseObjectJsonArgument<Mocha.MochaOptions>({
                object: this.backendOptions[MOCHA_OPTION],
                optional: true,
                name: MOCHA_OPTION
            }),
            factoryAttributes: parseObjectJsonArgument<StringDictionary>({
                object: this.backendOptions[DEVFILE_ATTRIBUTES_OPTIONS],
                optional: true,
                name: DEVFILE_ATTRIBUTES_OPTIONS
            })
        }, createAuthenticator(this.backendOptions));
        return await runner.runTests(this.backendOptions[TESTS_ARGUMENT]);
    }
}

/**
 * {@link BaseBrowser} factory.
 * @param options {@link BaseStrictOptions}
 * @param ctor any of {@link TheiaBrowser}, {@link CheTheiaBrowser} or any super {@link BaseBrowser} constructors
 * @returns new {@link BaseBrowser}
 */
async function createBrowser(options: BaseStrictOptions, ctor: new (name: string, options: BrowserOptions) => BaseBrowser) {
    return new ctor(getBrowserName(options[BROWSER_OPTION]), {
        browserLocation: await getBrowserLocation(options[BROWSER_OPTION]),
        cleanSession: options[CLEAN_OPTION],
        driverLocation: options[DRIVER_OPTION],
        logLevel: options[LOG_OPTION],
        timeouts: parseObjectJsonArgument({
            object: options.timeouts,
            optional: true,
            name: 'timeouts'
        }) as ITimeouts
    });
}

/**
 * Create Eclipse Che authenticator object. Currently only OpenShift is supported.
 * @param options sanitized {@link CheStrictOptions}
 * @returns new {@link OpenShiftAuthenticator}
 */
function createAuthenticator(options: CheStrictOptions) {
    if (isAuthenticationOptionSupported(options)) {
        switch (options[AUTHENTICATION_OPTION]) {
            case 'openshift':
                return createOpenshiftAuthenticator();
            default:
                throw new Error(`Unsupported authentication method "${options[AUTHENTICATION_OPTION]}".`);
        }
    }
}

/**
 * Create new {@link OpenShiftAuthenticator}. This function requires environmental
 * variables such as *CHE_USERNAME* and *CHE_PASSWORD* to be defined.
 * 
 * Optional environmental arguments:
 * 
 *  - **CHE_MULTI_STEP_FORM**: treat login form as multi step (each field needs to be confirmed
 *  by ENTER key). Supported values can be found in {@link TRUE_STRINGS} and {@link FALSE_STRINGS}
 *  - **CHE_LOGIN_METHOD**: text of button to be clicked when logging in (eg. *my_htpasswd_provider*).
 * 
 * @returns new {@link OpenShiftAuthenticator} object
 * @throws **Error** :: *CHE_USERNAME* or *CHE_PASSWORD* are not defined in environment variables.
 */
function createOpenshiftAuthenticator() {
    const errors = [];

    if (process.env.CHE_USERNAME === undefined) {
        errors.push('CHE_USERNAME is not defined');
    }

    if (process.env.CHE_PASSWORD === undefined) {
        errors.push('CHE_PASSWORD is not defined');
    }

    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }

    return new OpenShiftAuthenticator({
        inputData: [
            {
                name: 'username',
                // @ts-expect-error
                value: process.env.CHE_USERNAME
            },
            {
                name: 'password',
                // @ts-expect-error
                value: process.env.CHE_PASSWORD
            }
        ],
        multiStepForm: process.env.CHE_MULTI_STEP_FORM ? stringToBoolean(process.env.CHE_MULTI_STEP_FORM) : true,
        loginMethod: process.env.CHE_LOGIN_METHOD ?? 'DevSandbox'
    });
}

/**
 * Convert string to boolean. Supported values can be found in {@link TRUE_STRINGS} and {@link FALSE_STRINGS}.
 * @param str string to be converted
 * @returns converted boolean from string
 * @throws **TypeError** :: str is not neither from {@link TRUE_STRINGS} or {@link FALSE_STRINGS}.
 */
function stringToBoolean(str: string): boolean {
    str = str.trim().toLocaleLowerCase();

    if (TRUE_STRINGS.includes(str)) {
        return true;
    }
    if (FALSE_STRINGS.includes(str)) {
        return false;
    }

    throw new TypeError(`Invalid value "${str}".`);
}

/**
 * Delete and create directory.
 * @param workspace path in string format
 * @returns workspace path in string format
 */
async function prepareWorkspace(workspace: string): Promise<string> {
    // prepare workspace
    await fs.remove(workspace);
    await fs.mkdir(workspace);
    return workspace;
}

async function copyFile(source: string, destination: string): Promise<string> {
    await fs.copy(source, destination);
    return destination;
}