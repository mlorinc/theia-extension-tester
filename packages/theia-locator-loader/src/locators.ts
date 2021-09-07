import { DeepPartial } from 'ts-essentials';
 
/**
 * Definition for locator diff object
 */
export interface LocatorDiff<T> {
    locators: DeepPartial<T>
    extras?: Object
}
