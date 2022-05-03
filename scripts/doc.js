import * as fs from "fs-extra";
import * as path from "path";
import { program } from 'commander';

const DOCS_ROOT = path.resolve('./docs');

function main() {
    program.command('prepare')
        .description('Copy documentation files into wiki repository.')
        .argument(`<wiki_repository>`, 'Path to the wiki repository')
        .action(cheAction);

    program.parse(process.argv);
}

if (require.main === module) {
    main();
}