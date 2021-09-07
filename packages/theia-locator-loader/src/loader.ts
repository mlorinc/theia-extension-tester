import * as fs from 'fs-extra';
import * as path from 'path';
import clone = require('clone-deep');
import { LocatorDiff } from './locators';
import compareVersions = require('compare-versions');

/**
 * Utility for loading locators for a given editor version
 */
export abstract class LocatorLoader<T> {
    private baseVersion: string;
    private baseFolder: string;
    private version: string;
    private locators: T;

    /**
     * Construct new loader for a given editor version
     * @param version select version of editor
     */
    constructor(version: string, baseVersion: string, baseFolder: string) {
        this.version = this.parseVersion(version)
        this.baseVersion = baseVersion;
        this.baseFolder = path.resolve(baseFolder);
        const temp = require(path.resolve(baseFolder, baseVersion));
        this.locators = temp.locators;
    }

    protected abstract parseVersion(version: string): string;

    /**
     * Loads locators for the selected editor version
     * @returns object containing all locators
     */
    loadLocators(): T {
        let versions = fs.readdirSync(this.baseFolder)
            .filter((file) => file.endsWith('.js'))
            .map((file) => path.basename(file, '.js'));
        
        if (compareVersions(this.baseVersion, this.version) === 0) {
            return this.locators;
        }

        if (compareVersions(this.baseVersion, this.version) < 0) {
            versions = versions.filter((ver) => 
                    compareVersions(this.baseVersion, ver) < 0 &&
                    compareVersions(ver, this.version) <= 0)
                .sort(compareVersions);
        } else {
            versions = versions.filter((ver) => 
                compareVersions(this.baseVersion, ver) > 0 &&
                compareVersions(ver, this.version) >= 0)
            .sort(compareVersions).reverse();
        }

        for (let i = 0; i < versions.length; i++) {
            const diff = require(path.join(this.baseFolder, versions[i])).diff as LocatorDiff<T>;

            this.locators = mergeLocators(this.locators, diff);
        }
        return this.locators;
    }
}

function mergeLocators<T>(original: T, diff: LocatorDiff<T>): T {
    const target = clone(original);
    const targetDiff = diff.locators;

    merge(target, targetDiff) as T;
    return target;
}

function merge(target: any, obj: any) {
    for (const key in obj) {
        if (key === '__proto__' || !Object.prototype.hasOwnProperty.call(obj, key)) {
            continue;
        }

        let oldVal = obj[key];
        let newVal = target[key];

        if (typeof(newVal) === 'object' && typeof(oldVal) === 'object') {
            target[key] = merge(newVal, oldVal);
        } else {
            target[key] = clone(oldVal);
        }
    }
    return target;
}
