# `path-utils`

Path utils package used by [theia-extension-tester](https://www.npmjs.com/package/theia-extension-tester). The package contains functions
which are primarily designed to solve problems when working with
tree page objects.

## Usage

The package consist of several functions. Currently only Unix parts
are supported.

Install via npm

`npm install @theia-extension-tester/path-utils`

Install via yarn

`yarn add @theia-extension-tester/path-utils`

Remove path white space from beginning, end and remove
trailing path separator.

```ts
function trimPath(filePath: string): string;
```

Split a path using path separator.

```ts
function splitPath(filePath: string): string[];
```

Convert path into Eclipse Theia tree string format and return path segments.

```ts
function convertToTreePath(filePath: string): string[];
```

Convert file path to relative path from given root.

```ts
function getRelativePath(filePath: string, root: string): string;
```

Test if the path is relative to path argument to.

```ts
function isRelativeTo(path: string[], to: string[]): boolean;
```

Transform given path to acceptable format used in Eclipse Theia tree components.

```ts
function normalizePath(filePath: string): string;
```

Compare paths based on position where they would have been shown in Eclipse Theia tree.

```ts
function comparePaths(a: string[], b: string[], aIsFile: boolean = false, bIsFile: boolean = false): number;
```

The string alternative comparator.

```ts
comparePathsString(a: string, b: string, aIsFile: boolean = false, bIsFile: boolean = false): number;
```

