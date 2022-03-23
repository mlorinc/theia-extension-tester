import * as fs from 'fs-extra';
import * as path from 'path';
import { StringDictionary } from './options';

/**
 * Return browser name recognized by Selenium WebDriver.
 * @param browser path or any browser name from the following list: chrome, firefox, edge, opera, safari.
 * @returns browser name compatible with Selenium WebDriver
 * @throws **Error** :: browser name could not be found
 */
export function getBrowserName(browser: string): string {
    browser = path.parse(browser).base.toLowerCase();
    const chrome = 'chrome';
    const firefox = 'firefox';
    const edge = 'MicrosoftEdge';
    const opera = 'opera';
    const safari = 'safari';


    const supportedBrowsers: StringDictionary = {
        chrome, firefox, edge, opera, safari
    }

    for (const supportedBrowser of Object.keys(supportedBrowsers)) {
        if (browser.includes(supportedBrowser)) {
            return supportedBrowsers[supportedBrowser];
        }
    }

    throw new Error(`Could not find supported browser for "${browser}".`);
}

/**
 * Verify and return browser path.
 * @param browser browser path to be verified
 * @returns verified browser path or undefined
 */
export async function getBrowserLocation(browser: string): Promise<string | undefined> {
    if (await fs.pathExists(browser)) {
        return browser;
    }
    return undefined;
}

/**
 * Parse option which can be either json string or path to json file.
 * @param fileOrJson json in string format or file path
 * @param optional allow {@link fileOrJson} to be undefined. True by default.
 * @param name name used solely for debugging purposes and error reports.
 * @returns JavaScript object
 * @throws 
 *  - **Error** :: {@link optional} is set to false and {@link fileOrJson} is undefined
 *  - **Error** :: {@link fileOrJson} is invalid string json
 *  - **Error** :: {@link fileOrJson} file path does not exist
 */
export async function parseFileJsonArgument(fileOrJson: string | undefined, optional: boolean = true, name?: string): Promise<any> {
    if (fileOrJson === undefined) {
        if (optional) {
            return {};
        }
        else {
            throw new Error(`"${name}" option is undefined.`);
        }
    }

    try {
        if (fileOrJson.trimStart().startsWith('{')) {
            return JSON.parse(fileOrJson);
        }
        else if (await fs.pathExists(fileOrJson)) {
            return await fs.readJson(fileOrJson);
        }
        else {
            throw new Error(`Invalid value for "${name ?? 'unknown'} option": "${fileOrJson}"`);
        }
    }
    catch (e) {
        console.error(`Could not parse "${name ?? 'unknown'}" option. Reason: ${e instanceof Error ? e.message : e}`);

        if (e instanceof SyntaxError) {
            console.error(`JSON value:\n${fileOrJson}`);
        }

        process.exit(1);
    }
}

/**
 * Options for {@link complexParse} function.
 */
export interface ComplexParseOptions {
    /**
     * Given {@link object} is optional.
     */
    optional?: boolean;
    /**
     * Allow object to be returned without transformation if {@link complexParse} does not have transformation rule.
     */
    passThrough?: boolean;
    /**
     * Name used solely for debugging purposes and error reports.
     */
    name?: string;
    /**
     * Object to be transformed.
     */
    object: any;
}

/**
 * Transform object passed in {@link options} according to {@link rules}.
 * @param rules rules to be used to determine transformation
 * @param options transformation options. See {@link ComplexParseOptions} for more details.
 * @returns transformed object
 */
export function complexParse(rules: { [key: string]: Function }, options: ComplexParseOptions): any {
    const valueType = typeof options.object;

    if (valueType === 'undefined' && options.optional) {
        return undefined;
    }

    if (!Object.keys(rules).includes(valueType) && options.passThrough) {
        return options.object;
    }

    return rules[valueType](options.object);
}

/**
 * Options for {@link parseObjectJsonArgument} function.
 */
export interface ObjectJsonArgumentParseOptions extends ComplexParseOptions {
    /**
     * Convert object to json string.
     */
    stringifyObject?: boolean;
}

/**
 * Transform object passed in {@link options} (in string format) to generic JavaScript object.
 * Input object must be string or plain object. String is then transformed to object directly in
 * case of json string. If file path was passed then json is read from the file.
 * @param options transformation options. See {@link ObjectJsonArgumentParseOptions} for more details.
 * @returns transformed object
 */
export function parseObjectJsonArgument<T>(options: ObjectJsonArgumentParseOptions): T {
    return complexParse({
        'string': (value: string) => parseFileJsonArgument(value, options.optional, options.name),
        'object': (value: object) => options.stringifyObject ? JSON.stringify(value) : value
    }, options) as T;
}