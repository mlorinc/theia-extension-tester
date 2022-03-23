import { ITimeouts } from '@theia-extension-tester/base-browser';
import { logging } from '.';

export type StringDictionary = { [key: string]: string };

/**
 * List of supported browsers.
 */
const SupportedBrowsers = ['chrome', 'firefox', 'edge', 'opera', 'safari'] as const;

/**
 * List of supported authenticators.
 */
const SupportedAuthenticationMethods = ['openshift'] as const;

/**
 * Supported browsers.
 */
export type SupportedBrowser = typeof SupportedBrowsers[number];

/**
 * Supported authenticators.
 */
export type SupportedAuthenticationMethod = typeof SupportedAuthenticationMethods[number];

/**
 * CLI option data type.
 */
type Option<T> = {
    /**
     * Long name of the option.
     */
    name: string;
    /**
     * Short name of the option.
     */
    shortName?: string;
    /**
     * Name of the option value.
     */
    valueName?: string;
    /**
     * Option description which will be shown on help page.
     */
    description: string;
    /**
     * Default value of the option.
     */
    defaultValue: T;
}

/**
 * Default timeouts used in tester. 
 */
const defaultTimeouts: ITimeouts = {
    implicit: 30000,
    pageLoad: 300000
};

/**
 * Url option name.
 */
export const URL_OPTION = 'url';

/**
 * Browser option name.
 */
export const BROWSER_OPTION = 'browser';

/**
 * Driver option name.
 */
export const DRIVER_OPTION = 'driver';

/**
 * Clean environment option name.
 */
export const CLEAN_OPTION = 'clean';

/**
 * Log option name.
 */
export const LOG_OPTION = 'log';

/**
 * Timeouts option name.
 */
export const TIMEOUTS_OPTION = 'timeouts';

/**
 * Query option name.
 */
export const QUERY_OPTION = 'query';

/**
 * Folder option name.
 */
export const FOLDER_OPTION = 'folder';

/**
 * Copy files option name.
 */
export const COPY_FILES_OPTION = 'copy-files';

/**
 * Mocha option name.
 */
export const MOCHA_OPTION = 'mocha';

/**
 * Env option name.
 */
export const ENV_OPTION = 'env';

/**
 * Tests argument name.
 */
export const TESTS_ARGUMENT = 'tests';

/**
 * Authentication option name.
 */
export const AUTHENTICATION_OPTION = 'authentication';

/**
 * Devfile attributes option name.
 */
export const DEVFILE_ATTRIBUTES_OPTIONS = 'devfile-attributes';

/**
 * Devfile argument name.
 */
export const DEVFILE_ARGUMENT = 'devfile';


/**
 * Url option metadata.
 */
export const URL_OPTION_METADATA: Option<string> = {
    name: URL_OPTION,
    shortName: 'u',
    description: 'Url location to {{ IDE }}',
    defaultValue: 'http://localhost:3000/'
};


/**
 * Browser option metadata.
 */
export const BROWSER_OPTION_METADATA: Option<string> = {
    name: BROWSER_OPTION,
    shortName: 'b',
    description: 'Path to the Internet browser binary or one of the supported browser names',
    defaultValue: 'chrome'
};


/**
 * Driver option metadata.
 */
export const DRIVER_OPTION_METADATA: Option<undefined> = {
    name: DRIVER_OPTION,
    shortName: 'd',
    description: 'Path to the Selenium WebDriver binary. It can point to binary or parent folder of the binary.',
    defaultValue: undefined
};


/**
 * Clean environment option metadata.
 */
export const CLEAN_OPTION_METADATA: Option<boolean> = {
    name: CLEAN_OPTION,
    shortName: 'c',
    description: 'Clean session after testing',
    defaultValue: false
};

/**
 * Log option metadata.
 */
export const LOG_OPTION_METADATA: Option<string> = {
    name: LOG_OPTION,
    shortName: 'l',
    description: 'Log messages from Selenium WebDriver with a given level',
    defaultValue: 'Info'
};


/**
 * Timeouts option metadata.
 */
export const TIMEOUTS_OPTION_METADATA: Option<string> = {
    name: TIMEOUTS_OPTION,
    shortName: 't',
    description: 'Test timeouts. Must be path to JSON file or string with JSON format',
    defaultValue: JSON.stringify(defaultTimeouts)
};


/**
 * Query option metadata.
 */
export const QUERY_OPTION_METADATA: Option<string> = {
    name: QUERY_OPTION,
    shortName: 'q',
    description: 'HTTP query argument which will be appended to {{ IDE }} url. Must be path to JSON file or JSON string.',
    defaultValue: '{}'
};


/**
 * Folder option metadata.
 */
export const FOLDER_OPTION_METADATA: Option<undefined> = {
    name: FOLDER_OPTION,
    shortName: 'f',
    description: 'Open folder before user interface tests are launched',
    defaultValue: undefined
};


/**
 * Copy files option metadata.
 */
export const COPY_FILES_OPTION_METADATA: Option<Array<string>> = {
    name: COPY_FILES_OPTION,
    valueName: 'files',
    description: 'Copy files and folders into folder specified by --folder option.',
    defaultValue: []
};

/**
 * Env option metadata.
 */
export const ENV_OPTION_METADATA: Option<undefined> = {
    name: ENV_OPTION,
    shortName: 'e',
    description: 'Path to the .env file which will be loaded.',
    defaultValue: undefined
};


/**
 * Mocha option metadata.
 */
export const MOCHA_OPTION_METADATA: Option<string> = {
    name: MOCHA_OPTION,
    shortName: 'm',
    valueName: 'configuration',
    description: 'Mocha configuration. Must be path to mocha file or string with JSON format.',
    defaultValue: '{}'
};


/**
 * Authentication option metadata.
 */
export const AUTHENTICATION_OPTION_METADATA: Option<SupportedAuthenticationMethod> = {
    name: AUTHENTICATION_OPTION,
    shortName: 'a',
    description: 'Authentication mechanism to use when use is about to log in.',
    defaultValue: 'openshift'
};

/**
 * Devfile attributes option metadata.
 */
export const DEVFILE_ATTRIBUTES_OPTIONS_METADATA: Option<undefined> = {
    name: DEVFILE_ATTRIBUTES_OPTIONS,
    valueName: 'devfileAttributes',
    description: 'Devfile attributes to be overridden or appended to Devfile url.',
    defaultValue: undefined
};

/**
 * Common options for every test launcher.
 */
export interface BaseOptions {
    /**
     * Url location to editor under testing.
     */
    [URL_OPTION]?: string;

    /**
     * Path to the Internet browser binary or one of the supported browser names.
     */
    [BROWSER_OPTION]?: string | SupportedBrowser;

    /**
     * Path to the Selenium WebDriver binary.
     * It can point to binary or parent folder of the binary.
     */
    [DRIVER_OPTION]?: string;

    /**
     * Clean session after testing.
     */
    [CLEAN_OPTION]?: boolean;

    /**
     * Log messages from Selenium WebDriver with a given level.
     * 
     * Supported values are defined in {@link logging.Level}.
     */
    [LOG_OPTION]?: logging.Level;

    /**
     * Used timeouts when testing. 
     * 
     * Supported values: {@link ITimeouts} object, JSON string or JSON file path.
     */
    [TIMEOUTS_OPTION]?: ITimeouts | string;

    /**
     * Mocha configuration. 
     * 
     * Supported values: {@link Mocha.MochaOptions} object, JSON string or JSON file path.
     */
    [MOCHA_OPTION]?: Mocha.MochaOptions | string;

    /**
     * Load environmental variables from file.
     */
    [ENV_OPTION]?: string;

    /**
     * Tests to be executed.
     */
    [TESTS_ARGUMENT]: Array<string>;
}

/**
 * Common sanitized options for every test launcher.
 */
export interface BaseStrictOptions {
    /**
     * Url location to editor under testing.
     */
    [URL_OPTION]: string;

    /**
     * Path to the Internet browser binary or one of the supported browser names.
     */
    [BROWSER_OPTION]: string | SupportedBrowser;

    /**
     * Path to the Selenium WebDriver binary.
     * It can point to binary or parent folder of the binary.
     */
    [DRIVER_OPTION]?: string;

    /**
     * Clean session after testing.
     */
    [CLEAN_OPTION]: boolean;

    /**
     * Log messages from Selenium WebDriver with a given level.
     */
    [LOG_OPTION]: logging.Level;

    /**
     * Used timeouts when testing. 
     * 
     * Supported values: {@link ITimeouts} object, JSON string or JSON file path.
     */
    [TIMEOUTS_OPTION]: ITimeouts | string;

    /**
     * Mocha configuration. 
     * 
     * Supported values: {@link Mocha.MochaOptions} object, JSON string or JSON file path.
     */
    [MOCHA_OPTION]: Mocha.MochaOptions | string;

    /**
     * Load environmental variables from file.
     */
    [ENV_OPTION]?: string;

    /**
     * Tests to be executed.
     */
    [TESTS_ARGUMENT]: Array<string>;
}

/**
 * Common options for every Theia test launcher.
 */
export interface TheiaOptions extends BaseOptions {
    /**
     * HTTP query attributes which will be appended to editor url. Must be JavaScript object, path to JSON file or JSON string.
     */
    [QUERY_OPTION]?: string | StringDictionary;

    /**
     * Open folder before user interface tests are launched.
     */
    [FOLDER_OPTION]?: string;

    /**
     * Copy files into opened folder.
     */
    [COPY_FILES_OPTION]?: string[];
}

/**
 * Common sanitized options for every Theia test launcher.
 */
export interface TheiaStrictOptions extends BaseStrictOptions {
    /**
     * HTTP query attributes which will be appended to editor url. Must be JavaScript object, path to JSON file or JSON string.
     */
    [QUERY_OPTION]: string | StringDictionary;

    /**
     * Open folder before user interface tests are launched.
     */
    [FOLDER_OPTION]?: string;

    /**
     * Copy files into opened folder.
     */
    [COPY_FILES_OPTION]?: string[];
}

/**
 * Common options for every Che test launcher.
 */
export interface CheOptions extends BaseOptions {
    /**
     * Devfile attributes to be overridden via Url. Must be JavaScript object, path to JSON file or JSON string.
     */
    [DEVFILE_ATTRIBUTES_OPTIONS]?: string | StringDictionary;
    /**
     * Authenticator to be used in log in phase.
     */
    [AUTHENTICATION_OPTION]?: string;
    /**
     * Url to Devfile which will create test workspace.
     */
    [DEVFILE_ARGUMENT]: string;
}

export interface CheStrictOptions extends BaseStrictOptions {
    /**
     * Devfile attributes to be overridden via Url. Must be JavaScript object, path to JSON file or JSON string.
     */
    [DEVFILE_ATTRIBUTES_OPTIONS]?: string | StringDictionary;
    /**
     * Authenticator to be used in log in phase.
     */
    [AUTHENTICATION_OPTION]: string;
    /**
     * Url to Devfile which will create test workspace.
     */
    [DEVFILE_ARGUMENT]: string;
}

/**
 * Default option values for {@link BaseOptions}.
 */
export const BASE_DEFAULT_OPTIONS: BaseStrictOptions = {
    [URL_OPTION]: URL_OPTION_METADATA.defaultValue,
    [BROWSER_OPTION]: BROWSER_OPTION_METADATA.defaultValue,
    [DRIVER_OPTION]: DRIVER_OPTION_METADATA.defaultValue,
    [CLEAN_OPTION]: CLEAN_OPTION_METADATA.defaultValue,
    [LOG_OPTION]: (logging.Level as any)[LOG_OPTION_METADATA.defaultValue],
    [TIMEOUTS_OPTION]: TIMEOUTS_OPTION_METADATA.defaultValue,
    [MOCHA_OPTION]: MOCHA_OPTION_METADATA.defaultValue,
    [ENV_OPTION]: ENV_OPTION_METADATA.defaultValue,
    [TESTS_ARGUMENT]: Array<string>()
}

/**
 * Default option values for {@link TheiaOptions}.
 */
export const THEIA_DEFAULT_OPTIONS: TheiaStrictOptions = {
    ...BASE_DEFAULT_OPTIONS,
    [QUERY_OPTION]: QUERY_OPTION_METADATA.defaultValue,
    [FOLDER_OPTION]: FOLDER_OPTION_METADATA.defaultValue,
    [COPY_FILES_OPTION]: COPY_FILES_OPTION_METADATA.defaultValue,
}

/**
 * Default option values for {@link CheOptions}.
 */
export const CHE_DEFAULT_OPTIONS: CheStrictOptions = {
    ...BASE_DEFAULT_OPTIONS,
    [DEVFILE_ATTRIBUTES_OPTIONS]: DEVFILE_ATTRIBUTES_OPTIONS_METADATA.defaultValue,
    [AUTHENTICATION_OPTION]: AUTHENTICATION_OPTION_METADATA.defaultValue,
    [DEVFILE_ARGUMENT]: ''
}

/**
 * Convert option object to commander option string format.
 * @param option option object to be converted
 * @param replaceDictionary {@link StringDictionary} of aliases to be replaced in format {{ key }} => value.
 * @returns list of strings which can be used in commander via spread operator (...list).
 */
export function optionToCli(option: Option<any>, replaceDictionary: StringDictionary): [string, string, string | undefined] {
    let name = option.name;
    let shortName = option.shortName;
    let defaultValue = option.defaultValue;
    let description = option.description;

    for (const key of Object.keys(replaceDictionary)) {
        // inefficient but inputs are short anyway
        description = description.replace(RegExp(`\\{\\{\\s+${key}\\s+\\}\\}`, 'g'), replaceDictionary[key]);
    }

    const flags = flagFormatter(name, shortName, getValueName(option));
    return [flags, description, defaultValue];
}

/**
 * Determine value name from option object. Boolean values do not have value names by default.
 * Value names are used as keys in commander object.
 * @param option option type in question
 * @returns value name for given option
 * @throws **Error** :: if boolean option has value name defined. This is not allowed by design. Boolean options are treated as flags
 * and value can be accessed via option name.
 */
function getValueName(option: Option<any>): string | undefined {
    if (typeof option.defaultValue === 'boolean') {
        if (option.valueName) {
            throw new Error('Unexpected combination of boolean default value and option value name (presence of value name might be wrong).');
        }

        return undefined;
    }

    return option.valueName ?? option.name;
}

/**
 * Parse option strings to commander format. 
 * @param name name of some option
 * @param shortName short name of some option
 * @param valueName value name of some option
 * @returns valid formatted commander option string
 * @throws **Error** :: when name is blank
 */
function flagFormatter(name: string, shortName: string | undefined, valueName: string | undefined): string {
    let flag = '';

    //'-b, --binary <path>'
    if (shortName) {
        flag += `-${shortName}`;
    }

    if (name && shortName) {
        flag += `, --${name}`;
    }
    else if (name) {
        flag += `--${name}`;
    }
    else {
        throw new Error(name?.trim() === '' ? 'Name is blank.' : `Invalid name "${name}".`);
    }

    if (valueName && name === COPY_FILES_OPTION_METADATA.name) {
        flag += ` <${valueName}...>`
    }
    else if (valueName) {
        flag += ` <${valueName}>`
    }

    return flag;
}

/**
 * Check if authentication method is available and supported.
 * @param options sanitized options from tester launcher
 * @returns true if the method is supported, false otherwise
 */
export function isAuthenticationOptionSupported(options: CheStrictOptions) {
    return (SupportedAuthenticationMethods as readonly string[]).includes(options[AUTHENTICATION_OPTION].toLowerCase());
}