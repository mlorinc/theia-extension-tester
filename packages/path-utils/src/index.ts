import * as path from 'path';
import * as os from 'os';

export module PathUtils {
    /**
     * Remove path white space from beginning, end and remove trailing path separator.
     * @param filePath Path to be trimmed.
     * @returns Trimmed path as string.
     */
    export function trimPath(filePath: string): string {
        let start = 0;
        let end = filePath.length;

        if (filePath.endsWith(path.sep)) {
            end = -1;
        }

        return filePath.slice(start, end).trim();
    }

    /**
     * Split a path using path separator.
     * @param filePath Path to be split.
     * @returns An array of path segments.
     */
    export function splitPath(filePath: string): string[] {
        const segments = trimPath(filePath).split(path.sep);

        if (segments[0].length === 0) {
            segments[0] = '/';
        }

        return segments;
    }

    /**
     * Convert path into Eclipse Theia tree string format and return segments.
     * @param filePath Path to be converted and split.
     * @returns Tree path segments.
     */
    export function convertToTreePath(filePath: string): string[] {
        filePath = normalizePath(filePath);
        const segments: string[] = [];
        if (path.isAbsolute(filePath)) {
            segments.push('/');
        }
        return splitPath(filePath);
    }

    /**
     * Convert file path to relative path from given {@link root}.
     * @param filePath File path to be converted into relative.
     * @param root Base path. Must contain the file path as child (does not have to be direct child).
     * @returns Relative path based on the {@link root} path.
     * @throws Error :: When {@link filePath} is not child of the {@link root} path.
     */
    export function getRelativePath(filePath: string, root: string): string {
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

    /**
     * Test if the {@link path} is relative to path argument {@link to}.
     * @param path Segments of the absolute path.
     * @param to Segments of the absolute path.
     * @returns True if the {@link path} path segments are relative to the segments {@link to}.
     */
    export function isRelativeTo(path: string[], to: string[]): boolean {
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

    /**
     * Transform given path to acceptable format used in Eclipse Theia tree components.
     * @param filePath A file path to be transformed.
     * @returns The {@link filePath} in the acceptable format.
     */
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

    /**
     * Compare paths based on position where they would have been shown in Eclipse Theia tree.
     * @param a Segments of first path.
     * @param b Segments of second path.
     * @param parentIndex An index where the common parent is part of the segments {@link a} and {@link b}.
     * @param aIsFile File type of the path {@link a}.
     * @param bIsFile File type of the path {@link b}.
     * @returns A numerical value according to the following rules:
     *  1. == 0 :: Paths are equal.
     *  2. \>= 1 :: The path {@link a} is greater therefore it would have been rendered below the path {@link b}.
     *  3. <= 1 :: The path {@link a} is lesser therefore it would have been rendered above the path {@link b}.
     */
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

    /**
     * Determine if the path is root.
     * @param a Path segments to be analyzed.
     * @returns True if the path is the root.
     */
    function isRoot(a: string[]) {
        return a.length === 1 && a[0] === '/';
    }

    /**
     * Determine if the index is pointing on last path segment.
     * @param a Path segments to be analyzed.
     * @param index An index to be used in analysis.
     * @returns True if the index points to last segment.
     */
    function isLeaf(a: string[], index: number): boolean {
        return a.length === index + 1;
    }

    /**
     * Determine if an index points to a file.
     * @param a Path segments to be analyzed.
     * @param index An index to be used in analysis.
     * @param isFileFlag File flag. If set to false then the function returns false as well.
     * @returns True if index points to last segment and path points to a file.
     */
    function isFile(a: string[], index: number, isFileFlag: boolean): boolean {
        return isLeaf(a, index) && isFileFlag;
    }

    /**
     * Compare paths based on position where they would have been shown in Eclipse Theia tree.
     * @param a Segments of first path.
     * @param b Segments of second path.
     * @param aIsFile File type of the path {@link a}.
     * @param bIsFile File type of the path {@link b}.
     * @returns A numerical value according to the following rules:
     *  1. == 0 :: Paths are equal.
     *  2. \>= 1 :: The path {@link a} is greater therefore it would have been rendered below the path {@link b}.
     *  3. <= 1 :: The path {@link a} is lesser therefore it would have been rendered above the path {@link b}.
     * @see {@link comparePathsString} - Alternate function which uses path strings instead.
     */
    export function comparePaths(a: string[], b: string[], aIsFile: boolean = false, bIsFile: boolean = false): number {
        if (a.length === 0) {
            throw new Error('Path "a" must not be empty');
        }

        if (b.length === 0) {
            throw new Error('Path "b" must not be empty');
        }

        const aSegments = a
        const bSegments = b;

        // Iterate until short path is exhausted.
        const length = Math.min(aSegments.length, bSegments.length);

        // Find the last common parent of both paths.
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

    /**
     * Compare paths based on position where they would have been shown in Eclipse Theia tree.
     * @param a First path.
     * @param b Second path.
     * @param aIsFile File type of the path {@link a}.
     * @param bIsFile File type of the path {@link b}.
     * @returns A numerical value according to the following rules:
     *  1. == 0 :: Paths are equal.
     *  2. \>= 1 :: The path {@link a} is greater therefore it would have been rendered below the path {@link b}.
     *  3. <= 1 :: The path {@link a} is lesser therefore it would have been rendered above the path {@link b}.
     * @see {@link comparePaths} - Alternate function which uses path segments instead.
     */
    export function comparePathsString(a: string, b: string, aIsFile: boolean = false, bIsFile: boolean = false): number {
        return PathUtils.comparePaths(PathUtils.convertToTreePath(a), PathUtils.convertToTreePath(b), aIsFile, bIsFile);
    }
}
