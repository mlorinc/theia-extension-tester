import * as path from 'path';
export { TheiaElement } from './TheiaElement';
export * from './RepeatAction';
export * from './locators/TheiaLocators';
export { By } from 'extension-tester-page-objects';



export type PlatformType = 'che' | 'codeready' | 'theia';

export function getLocatorsPath(platform: PlatformType): string {
    return path.resolve(__dirname, 'locators', platform as string, 'versions');
}