const path = require("path");
const fs = require("fs-extra");

const conf = path.join(process.cwd(), ".vscode", "readme.code-snippets");
const json = fs.readJSONSync(conf);
const wiki = path.resolve("./docs");

const helperSnippets = {
    "npm:mocha": {
        "scope": "markdown",
        "prefix": ["npm:mocha"],
        "body": "[${TM_SELECTED_TEXT:mocha}](https://www.npmjs.com/package/mocha)",
        "description": `Add mocha npm link.`
    },

    "helper:code-usage": {
        "scope": "markdown",
        "prefix": ["helper:code-usage"],
        "body": "${TM_SELECTED_TEXT:Functionality description.}\n\n```ts\n${2:console.log(\"Hello, world!\")}\n```",
        "description": `Add usage example part.`
    },
    "helper:devfile-registry": {
        "scope": "markdown",
        "prefix": ["helper:devfile-registry"],
        "body": "[${TM_SELECTED_TEXT:Devfile registry}](https://codeready-codeready-workspaces-operator.apps.sandbox.x8i5.p1.openshiftapps.com/devfile-registry/devfiles/)",
        "description": `Add devfile registry link.`
    }
}

async function main() {
    const packageSnippets = await generatePackageSnippets();
    const wikiSnippets = generateWikiSnippets();


    fs.writeJsonSync(conf, {
        ...helperSnippets,
        ...packageSnippets,
        ...wikiSnippets
    }, { spaces: 4 });
}

export function getFileObjects(dirPath) {
    return fs.readdirSync(dirPath, {
        encoding: "utf8"
    }).map((x) => path.join(dirPath, x));
}

export function getFiles(dirPath) {
    return getFileObjects(dirPath).filter((file) => fs.lstatSync(file).isFile());
}

export function getDirectories(dirPath) {
    return getFileObjects(dirPath).filter((file) => fs.lstatSync(file).isDirectory());
}

export function extractPackageName(packageName) {
    const segments = packageName.split("/");

    if (segments.length === 1) {
        return {
            namespace: undefined,
            name: segments[0]
        }
    }
    else {
        return {
            namespace: segments[0],
            name: segments[1]
        }
    }    
}

function getWikiFiles() {
    const dirs = ["general", "guides", "page-objects"];
    return dirs
        .map((dir) => path.join(wiki, dir))
        .flatMap((dir) => getFiles(dir))
        .filter((x) => x.endsWith(".md"));
}

function createSnippet(packageName) {
    const { namespace, name } = extractPackageName(packageName);
    return {
        [name || namespace]: {
            "scope": "markdown",
            "prefix": [`npm:${name || namespace}`],
            "body": `[\${TM_SELECTED_TEXT:${formatName(namespace, name)}}](https://www.npmjs.com/package/${formatName(namespace, name)})`,
            "description": `Add ${formatName(namespace, name)} markdown link`
        }
    };
}

function createInstallSnippet(packageName) {
    const { namespace, name } = extractPackageName(packageName);

    return {
        ["install:" + name || namespace]: {
            "scope": "markdown",
            "prefix": [`install:${name || namespace}`],
            "body": `Install via npm\n\n\`npm install ${formatName(namespace, name)}\`\n\nInstall via yarn\n\n\`yarn add ${formatName(namespace, name)}\``,
            "description": `Install ${formatName(namespace, name)} markdown`
        }
    };
}

function createHomepageSnippet(packageName, folderName) {
    const { namespace, name } = extractPackageName(packageName);

    return {
        ["homepage:" + name || namespace]: {
            "scope": "json",
            "prefix": [`homepage:${name || namespace}`],
            "body": (namespace && folderName) ? `"https://github.com/mlorinc/theia-extension-tester/tree/master/packages/${folderName}"` : '"https://github.com/mlorinc/theia-extension-tester"',
            "description": `Add homepage link ${formatName(namespace, name)} to json.`
        }
    };
}

function formatName(namespace, name) {
    return (namespace ? namespace + "/" : "") + name;
}

function zip(a, b) {
    return a.map((k, i) => [k, b[i]]);
}

async function generatePackageSnippets() {
    const packageDirs = fs.readdirSync("packages", {
        encoding: "utf8"
    });
    const packages = packageDirs.map(x => path.join("packages", x));

    console.log("Collecting packages: ", packages);
    
    const names = await Promise.all(packages.map(async (dir) =>
        fs.readJSON(path.join(dir, "package.json")).then((packageJson) => packageJson.name)));

    const snippets = {
        "npm-theia": json["npm-theia"],
        "npm-vscode": json["npm-vscode"],
        "npm-extension-tester-page-objects": json["npm-extension-tester-page-objects"]   
    };

    const nameSnippets = zip(names, packageDirs)
        .map(([name, dir]) => ({...createSnippet(name), ...createInstallSnippet(name), ...createHomepageSnippet(name, dir)}))
        .reduceRight((acc, x) => ({...acc, ...x}));

    return {
        ...snippets,
        ...nameSnippets   
    };
}

function createWikiSnippet([dir, file]) {
    const name = `wiki:${dir}:${file}`;
    return {
        [name]: {
            "scope": "markdown",
            "prefix": [`${name}`],
            "body": `[${file.replace(/\s+/g, " ")}](https://github.com/mlorinc/theia-extension-tester/wiki/${file})`,
            "description": `Add ${file} markdown link`
        }
    };    
}

function wikiCategory(dir) {
    const category = dir.replace(wiki, "");
    return category.startsWith("/") ? category.slice(1) : category;
}

function generateWikiSnippets() {
    const files = getWikiFiles();
    console.log("Collecting wiki pages: ", files);
    return files
        .map((x) => [path.dirname(x), path.basename(x, ".md")])
        .map(([x, y]) => [wikiCategory(x), y])
        .map(([x, y]) => [x.replace(/\s+/g, "-"), y.replace(/\s+/g, "-")])
        .map(([x, y]) => [x.replace("." + path.sep, ""), y])
        .map(([x, y]) => [x.replace(path.sep, ":"), y])
        .map(([x, y]) => [x.endsWith(":") ? x.slice(0, -1) : x, y])
        .map(createWikiSnippet)
        .reduceRight((acc, x) => ({
            ...acc,
            ...x
        }));
}

main();
