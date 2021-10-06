import * as tsPaths from "tsconfig-paths";
import * as fs from "fs";
import * as path from "path";

export function load(mainFilePath: string, alias: string, tsConfigPath?: string): (() => void) {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath ?? "tsconfig.json", {
        encoding: "utf-8"
    }));

    const baseUrl = tsConfig.compilerOptions.baseUrl ?? ".";
    let mainFile: string;

    if (path.isAbsolute(mainFilePath)) {
        mainFile = mainFilePath;
    }
    else if (process.env.ADAPTER_PROJECT_ROOT) {
        mainFile = path.join(process.env.ADAPTER_PROJECT_ROOT, "node_modules", mainFilePath)
    }
    else {
        mainFile = path.join("node_modules", mainFilePath);
    }

    if ((mainFile.endsWith('.js') && !fs.existsSync(mainFile)) || !(fs.existsSync(`${mainFile}.js`))) {
        throw new Error(`Could not find module "${mainFile}".`);
    }

    const paths = {
        [alias]: [mainFile]
    };

    console.log(`Created aliases:\n${Object.keys(paths).map((key) => `${key} => ${paths[key].join(' | ')}`).join('\n')}`);

    return tsPaths.register({
        baseUrl,
        paths
    });
}
