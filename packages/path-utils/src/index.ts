import * as path from 'path';
import * as os from 'os';

export module PathUtils {
    export function trimPath(filePath: string): string {
        let start = 0;
        let end = filePath.length;

        if (filePath.endsWith(path.sep)) {
            end = -1;
        }

        return filePath.slice(start, end);
    }

    export function splitPath(filePath: string): string[] {
        const segments = trimPath(filePath).split(path.sep);

        if (segments[0].length === 0) {
            segments[0] = '/';
        }
        
        return segments;
    }

    export function convertToTreePath(filePath: string): string[] {
        filePath = normalizePath(filePath);
        const segments: string[] = [];
        if (path.isAbsolute(filePath)) {
            segments.push('/');
        }
        return splitPath(filePath);
    }

    export function getRelativePath(filePath: string, root: string) {
        root = normalizePath(root);
        filePath = normalizePath(filePath);

        if (!path.isAbsolute(root)) {
            throw new Error(`Root path must be absolute. Got: "${root}".`);
        }

        if (!path.isAbsolute(filePath)) {
            return filePath;
        }

        if (root === filePath) {
            throw new Error('Cannot create relative path. Paths are equal.');
        }

        const relativePath = path.relative(root, filePath);

        if (relativePath.startsWith('..' + path.sep)) {
            throw new Error(`Could not create relative path. Got: "${filePath}". Root path: "${root}".`);
        }

        return relativePath;
    }

    export function isRelativeTo(path: string[], to: string[]) {
        if (path.length < to.length) {
            return false;
        }

        for (let i = 0; i < to.length; i++) {
            if (path[i] !== to[i]) {
                return false;
            }
        }
        return true;
    }

    export function normalizePath(filePath: string): string {
        filePath = filePath.trim();
        if (filePath.startsWith('~/') || filePath === '~') {
            filePath = filePath.replace('~', os.homedir());
        }
        filePath = path.normalize(filePath);

        let end = filePath.length;
        if (filePath.endsWith(path.sep)) {
            end = -1;
        }
        return filePath.slice(0, end);
    }


    function compare(a: string[], b: string[], parentIndex: number, aIsFile: boolean, bIsFile: boolean): number {
        if (isRoot(a) && isRoot(b)) {
            return 0;
        }
        else if (isRoot(a)) {
            return -1;
        }
        else if(isRoot(b)) {
            return 1;
        }

        const leafIndex = parentIndex + 1;
        aIsFile = isFile(a, leafIndex, aIsFile);
        bIsFile = isFile(b, leafIndex, bIsFile);

        if (aIsFile === bIsFile) {
            return a[leafIndex].localeCompare(b[leafIndex]);
        }

        if (isFile(a, leafIndex, aIsFile)) {
            return 1;
        }
        else {
            return -1;
        }
    }

    function isRoot(a: string[]) {
        return a.length === 1 && a[0] === '/';
    }

    function isLeaf(a: string[], index: number): boolean {
        return a.length === index + 1;
    }

    function isFile(a: string[], index: number, isFileFlag: boolean): boolean {
        return isLeaf(a, index) && isFileFlag;
    }

    export function comparePaths(a: string[], b: string[], aIsFile: boolean = false, bIsFile: boolean = false): number {
        if (a.length === 0) {
            throw new Error('Path "a" must not be empty');
        }

        if (b.length === 0) {
            throw new Error('Path "b" must not be empty');
        }

        const aSegments = a
        const bSegments = b;

        const length = Math.min(aSegments.length, bSegments.length);

        let matches = 0;
        while (matches < length) {
            if (aSegments[matches] !== bSegments[matches]) {
                break;
            }
            matches += 1;
        }

        const commonParentIndex = matches > 0 ? matches - 1 : -1; 

        // check folder is parent
        if (matches === length) {
            return aSegments.length - bSegments.length;
        }

        return compare(aSegments, bSegments, commonParentIndex, aIsFile, bIsFile);
    }

    export async function comparePathsString(a: string, b: string, aIsFile: boolean = false, bIsFile: boolean = false): Promise<number> {
        return PathUtils.comparePaths(PathUtils.convertToTreePath(a), PathUtils.convertToTreePath(b), aIsFile, bIsFile);
    }
}
