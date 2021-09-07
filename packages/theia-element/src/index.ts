export { TheiaElement } from './TheiaElement';
export *  from './locators/TheiaLocators';

import * as path from "path";

export type PlatformType = 'che' | 'codeready' | 'theia';

export function getLocatorsPath(platform: PlatformType): string {
    return path.resolve(__dirname, 'locators', platform as string, 'versions');
}