#!/usr/bin/env node

import * as fs from 'fs-extra';
import * as path from 'path';
import { ITimeouts } from '@theia-extension-tester/base-browser';
import { program } from 'commander';
import { TheiaBrowser, TheiaBrowserRunner } from './';
import { theia } from '@theia-extension-tester/adapters';

const defaultTimeouts: ITimeouts = {
    implicit: 30000,
    pageLoad: 50000
};
const templateCommand = 'use-folder-as-template';

async function main() {
    program.description('Universal test runner for Eclipse Che and Eclipse Theia IDE.');

    program.command('theia:run')
        .description('Run UI test on Eclipse Theia web IDE.')
        .argument('<tests...>', 'Path to test suites which will be executed')
        .option('-u, --url <url>', 'Eclipse Theia web IDE url', 'http://localhost:3000/')
        .option('-b, --browser <path>', 'Path to the Internet browser binary or browser name', 'chrome')
        .option('-d, --driver <path>', 'Path to Selenium WebDriver binary')
        .option('-c, --clean', 'Clean session after testing', false)
        .option('-l, --log <level>', 'Log messages from webdriver with a given level', 'Info')
        .option('-t, --timeouts <timeouts>', 'Test timeouts. Might be path to file or string with JSON format', JSON.stringify(defaultTimeouts))
        .option('-q, --query <queries>', 'HTTP query argument which will be appended to Eclipse Theia url. Must be path to JSON file or JSON string.', '{}')
        .option('-f, --folder <folder>', 'Open folder before UI tests are performed')
        .option(`--${templateCommand} <destinationFolder>`, 'Use --folder options as template instead. Folder is copied to destinationFolder and opened.')
        .option('-m, --mocha <configuration>', 'Mocha configuration. Might be path to mocha file or string with JSON format.', '{}')
        .action(theiaAction);

    program.command('theia-electron:run')
        .description('Run UI test on Eclipse Theia Electron application.')
        .argument('<tests...>', 'Path to test suites which will be executed')
        .option('-b, --binary <path>', 'Path to Eclipse Theia binary')
        .option('-d, --driver <path>', 'Path to Selenium WebDriver binary')
        .option('-c, --clean', 'Clean session after testing', false)
        .option('-l, --log <level>', 'Log messages from webdriver with a given level', 'Info')
        .option('-t, --timeouts <timeouts>', 'Test timeouts. Might be path to file or string with JSON format', JSON.stringify(defaultTimeouts))
        .option('-f, --folder <folder>', 'Open folder before UI tests are performed')
        .option('-m, --mocha <configuration>', 'Mocha configuration. Might be path to mocha file or string with JSON format.', '{}')
        .action(theiaElectronAction);
    program.parse(process.argv);
}

async function theiaAction(tests: string[], options: any, command: any): Promise<void> {
    // apply theia adapter just in case if tests are using vscode-extension-tester
    theia();
    const browser = new TheiaBrowser(getBrowserName(options.browser), {
        browserLocation: await getBrowserLocation(options.browser),
        cleanSession: options.clean,
        distribution: 'codeready',
        driverLocation: options.driver,
        logLevel: options.level,
        timeouts: await parseFileJsonArgument(options.timeouts, true, 'timeouts') as ITimeouts
    });

    let folder: string = options.folder;
    if (options[templateCommand]) {
        if (options.folder === undefined) {
            throw new Error(`Cannot use --${templateCommand} without --folder.`)
        }
        folder = await prepareWorkspace(options.folder, options[templateCommand]);
    }

    const runner = new TheiaBrowserRunner(browser, {
        theiaUrl: options.url,
        openFolder: folder,
        mochaOptions: await parseFileJsonArgument(options.mocha, true, 'mocha') as Mocha.MochaOptions,
        query: await parseFileJsonArgument(options.query, true, 'query') as { [key: string]: string }
    });
    process.exit(await runner.runTests(tests));
}


async function theiaElectronAction(tests: string[], options: any, command: any): Promise<void> {
    console.log('Not supported at this moment');
    process.exitCode = 1;
}

function getBrowserName(browser: string): string {
    browser = path.parse(browser).base.toLowerCase();
    const chrome = 'chrome';
    const firefox = 'firefox';
    const edge = 'MicrosoftEdge';
    const opera = 'opera';
    const safari = 'safari';


    const supportedBrowsers: { [key: string]: string } = {
        chrome, firefox, edge, opera, safari
    }

    for (const supportedBrowser of Object.keys(supportedBrowsers)) {
        if (browser.includes(supportedBrowser)) {
            return supportedBrowsers[supportedBrowser];
        }
    }

    throw new Error(`Could not find supported browser for "${browser}".`);
}

async function getBrowserLocation(browser: string): Promise<string | undefined> {
    if (await fs.pathExists(browser)) {
        return browser;
    }
    return undefined;
}

async function parseFileJsonArgument(fileOrJson: string | undefined, optional: boolean = true, name?: string): Promise<any> {
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

async function prepareWorkspace(source: string, destination: string): Promise<string> {
    // prepare workspace
    await fs.remove(destination);
    await fs.mkdir(destination);
    await fs.copyFile(source, destination);
    return destination;
}

if (require.main === module) {
    main();
}