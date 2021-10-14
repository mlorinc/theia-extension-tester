import { load as commonLoad } from "./common";
import * as path from "path";

export function load(mainFilePath?: string, tsConfigPath?: string) {
    return commonLoad(mainFilePath ?? path.join('@theia-extension-tester', 'page-objects', 'lib', 'index.js'), 'vscode-extension-tester', tsConfigPath);
}
