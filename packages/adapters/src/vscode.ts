import { load as commonLoad } from "./common";
import * as path from "path";

export function load(mainFilePath?: string, tsConfigPath?: string) {
    return commonLoad(mainFilePath ?? path.join('vscode-extension-tester', 'out', 'extester.js'), '@theia-extension-tester/page-objects', tsConfigPath);
}
