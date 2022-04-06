Launching VS Code Extension tester tests ware one of the motivation reasons to create this library.
Currently it is possible but there some limitations:

1. System limitations: it is not possible to run tests which use `fs`, `child_process` or any system dependant library.
2. Some page objects do not share the same UI so they cannot be easily implemented for Eclipse Theia editors.
3. [Not all page objects are implemented](https://github.com/mlorinc/theia-extension-tester/wiki/Page-objects-status).
4. Code itself which work in Visual Studio Code might not work in slower instances of Eclipse Che. But this problem
can be worked around.

To launch tests on any of supported editors, first the tester package must be installed using:

```sh
npm install theia-extension-tester --save-dev
```

After that, please follow instructions in [Getting started with Eclipse Che guide](https://github.com/mlorinc/theia-extension-tester/wiki/Getting-started-with-Eclipse-Che#launching-first-test) or [Getting started with Eclipse Theia guide](https://github.com/mlorinc/theia-extension-tester/wiki/Getting-started-with-Eclipse-Theia#launching-first-test). In both guides JavaScripts imports do not have to be changed. Imports are handled by the tester
package itself e.g. `import "vscode-extension-tester" will be aliased to import "theia-extension-tester" automatically`.
