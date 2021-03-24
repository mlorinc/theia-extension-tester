// import { ExTester, logging } from "vscode-extension-tester";
// import * as path from "path";

// async function main() {
//     const tester = new ExTester(undefined, undefined, path.resolve(__dirname, '..', 'test-extensions'));
//     await tester.downloadCode();
//     await tester.downloadChromeDriver();
//     await tester.installVsix({vsixFile: path.resolve(__dirname, '..', 'vsix', 'vscode-camelk-0.0.22-111.vsix')});
//     await tester.runTests('out/tests/**/*.test.js', {
//         cleanup: false,
//         logLevel: logging.Level.ALL,
//         settings: path.resolve(__dirname, '..', 'vsix', 'vscode.json')
//     });
// }

// main();
