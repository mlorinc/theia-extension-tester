import * as tsPaths from 'tsconfig-paths';
import * as fs from 'fs';
import * as path from 'path';

export class AdapterModuleNotFound extends Error {}

export function load(moduleMainFilePath: string, alias: string, tsConfigPath?: string): (() => void) {
    let baseUrl: string | undefined;

    try {
        const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath ?? 'tsconfig.json', {
            encoding: 'utf-8'
        }));

        baseUrl = tsConfig.compilerOptions.baseUrl ?? '.';
    }
    catch {
        baseUrl = '.';
    }

    if (baseUrl !== '.') {
        throw new Error('tsConfig.compilerOptions.baseUrl is not supported at this moment.');
    }

    let mainFile: string | undefined;

    if (path.isAbsolute(moduleMainFilePath)) {
        if (!fs.existsSync(moduleMainFilePath)) {
            throw new Error(`Absolute path '${moduleMainFilePath}' does not exist.`);
        }

        mainFile = sanitizeModuleMainFilePath(moduleMainFilePath);
    }
    else {
        for (const nodeModulesPath of module.paths) {
            const filePath = path.join(nodeModulesPath, moduleMainFilePath);
            if (fs.existsSync(filePath)) {
                mainFile = sanitizeModuleMainFilePath(filePath);
                break;
            }
        }
        if (mainFile === undefined) {
            throw new AdapterModuleNotFound(`Could not find "${moduleMainFilePath}" in following node_modules:\n${module.paths.join('\n')}`);
        }
    }

    const paths = {
        [alias]: [path.relative(process.cwd(), mainFile)]
    };

    console.log(`Created aliases:\n${Object.keys(paths).map((key) => `${key} => ${paths[key].join(' | ')}`).join('\n')}`);

    return tsPaths.register({
        baseUrl,
        paths
    });
}

function sanitizeModuleMainFilePath(filePath: string): string {
    return filePath.endsWith('.js') ? filePath.slice(0, -3) : filePath;
}