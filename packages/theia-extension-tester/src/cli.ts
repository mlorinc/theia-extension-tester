#!/usr/bin/env node

import {
    AUTHENTICATION_OPTION_METADATA,
    BROWSER_OPTION_METADATA,
    CLEAN_OPTION_METADATA,
    COPY_FILES_OPTION_METADATA,
    DEVFILE_ARGUMENT,
    DEVFILE_ATTRIBUTES_OPTIONS_METADATA,
    DRIVER_OPTION_METADATA,
    ENV_OPTION_METADATA,
    FOLDER_OPTION_METADATA,
    LOG_OPTION_METADATA,
    MOCHA_OPTION_METADATA,
    optionToCli,
    QUERY_OPTION_METADATA,
    TESTS_ARGUMENT,
    TIMEOUTS_OPTION_METADATA,
    URL_OPTION_METADATA
    } from './options';
import { CheExTester, TheiaExTester } from './api';
import { program } from 'commander';

async function main() {

    // Define substitutions {{ IDE }} => Eclipse Theia
    const THEIA_DICTIONARY = {
        'IDE': 'Eclipse Theia'
    }

    const CHE_DICTIONARY = {
        'IDE': 'Eclipse Che'
    }

    program.description('Test launcher for Che-Theia and Theia based editors.');
    program.command('theia:run')
        .description('Launch user interface tests on Eclipse Theia.')
        .argument(`<${TESTS_ARGUMENT}...>', 'Path to the test suites which will be executed`)
        .option(...optionToCli(URL_OPTION_METADATA, THEIA_DICTIONARY))
        .option(...optionToCli(BROWSER_OPTION_METADATA, THEIA_DICTIONARY))
        .option(...optionToCli(DRIVER_OPTION_METADATA, THEIA_DICTIONARY))
        .option(...optionToCli(CLEAN_OPTION_METADATA, THEIA_DICTIONARY))
        .option(...optionToCli(LOG_OPTION_METADATA, THEIA_DICTIONARY))
        .option(...optionToCli(TIMEOUTS_OPTION_METADATA, THEIA_DICTIONARY))
        .option(...optionToCli(QUERY_OPTION_METADATA, THEIA_DICTIONARY))
        .option(...optionToCli(FOLDER_OPTION_METADATA, THEIA_DICTIONARY))
        .option(...optionToCli(COPY_FILES_OPTION_METADATA, THEIA_DICTIONARY))
        .option(...optionToCli(ENV_OPTION_METADATA, THEIA_DICTIONARY))
        .option(...optionToCli(MOCHA_OPTION_METADATA, THEIA_DICTIONARY))
        .action(theiaAction);

    program.command('che:run')
        .description('Launch user interface tests on Eclipse Che.')
        .argument(`<${DEVFILE_ARGUMENT}>`, 'Devfile url location. Devfiles are used for workspace creation.')
        .argument(`<${TESTS_ARGUMENT}...>`, 'Path to test suites which will be executed')
        .option(...optionToCli(URL_OPTION_METADATA, CHE_DICTIONARY))
        .option(...optionToCli(BROWSER_OPTION_METADATA, CHE_DICTIONARY))
        .option(...optionToCli(DRIVER_OPTION_METADATA, CHE_DICTIONARY))
        .option(...optionToCli(CLEAN_OPTION_METADATA, CHE_DICTIONARY))
        .option(...optionToCli(LOG_OPTION_METADATA, CHE_DICTIONARY))
        .option(...optionToCli(TIMEOUTS_OPTION_METADATA, CHE_DICTIONARY))
        .option(...optionToCli(DEVFILE_ATTRIBUTES_OPTIONS_METADATA, CHE_DICTIONARY))
        .option(...optionToCli(ENV_OPTION_METADATA, CHE_DICTIONARY))
        .option(...optionToCli(AUTHENTICATION_OPTION_METADATA, CHE_DICTIONARY))
        .option(...optionToCli(MOCHA_OPTION_METADATA, CHE_DICTIONARY))
        .action(cheAction);

    program.parse(process.argv);
}

async function theiaAction(tests: string[], options: any, command: any): Promise<void> {
    const tester = new TheiaExTester({
        ...options,
        tests
    });
    process.exit(await tester.runTests());
}

async function cheAction(devfile: string, tests: string[], options: any, command: any): Promise<void> {
    const tester = new CheExTester({
        ...options,
        devfile,
        tests
    });
    process.exit(await tester.runTests());
}

if (require.main === module) {
    main();
}