# theia-extension-tester-demo

This demo showcases user interface testing of [vscode-camelk](https://github.com/camel-tooling/vscode-camelk).
UI test creates new Simple.java integration, modifies time period, edits welcome message and validates all changes.

## Install instructions

1. Create new directory which will be used for git cloning
1. Follow instructions for [theia-extension-tester](https://github.com/mlorinc/theia-extension-tester)
1. Clone repository [mlorinc/vscode-extension-tester](https://github.com/mlorinc/vscode-extension-tester)
    1. run `npm install && npm pack`
1. Clone repository: `git clone git@github.com:mlorinc/theia-extension-tester-demo.git`
1. Install and compile typescript files: `npm install && npm run build` 

## Run tests

Visual Studio Code

`npm run vscode:test`

Eclipse Che

`npm run che:test`
