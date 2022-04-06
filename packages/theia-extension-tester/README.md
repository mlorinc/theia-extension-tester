# Theia Extension Tester

Theia Extension Tester is a package designed for testing graphical user interfaces
of Theia/VS Code extensions integrated to Eclipse Che and other Eclipse Theia based editors.

Writing new user interface tests consists of using page objects which represent
specific part of the editor user interface. Page objects are designed to
follow [VSCode Extension Tester](https://github.com/redhat-developer/vscode-extension-tester)
page objects as close as possible. Therefore existing user interface tests for VS Code extensions
can be reused fo Eclipse Theia based editors.

## <a name="installation"></a>Installation process

The fastest way to get started is to install starter package [theia-extension-tester](https://www.npmjs.com/package/theia-extension-tester) through npm or yarn.

>**npm**
>
> To install package with npm execute `npm install theia-extension-tester --save-dev`.

>**yarn**
>
> To install package using yarn execute `yarn add theia-extension-tester --dev`.

### <a name="driver">Selenium WebDriver

The project is using Selenium WebDriver library underneath. The library requires user
to download specific Selenium WebDriver from web browser vendor. This step has not
been automatized yet so it must be completed manually. Some of the most used Selenium
WebDriver can be found in the following table:

| Browser name   | Location                                                              |
|----------------|-----------------------------------------------------------------------|
| Chromium       | https://chromedriver.chromium.org/                                    |
| Firefox        | https://github.com/mozilla/geckodriver/releases                       |
| Microsoft Edge | https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/ |

After downloading and extracting any Selenium WebDriver make it executable by executing `chmod 755 <webdriver binary>`
in command line. The driver does not have to be placed in PATH variable.

## Getting started

After successful installation of [the package](#installation) and [Selenium WebDriver](#driver)
minor configuration steps are required to be performed which depend on selected editor:

- for Eclipse Che testing follow [Getting started with Eclipse Che](https://github.com/mlorinc/theia-extension-tester/wiki/Getting-started-with-Eclipse-Che)
- for Eclipse Theia testing follow [Getting started with Eclipse Theia](https://github.com/mlorinc/theia-extension-tester/wiki/Getting-started-with-Eclipse-Theia)
- for migration from [VSCode Extension Tester](https://github.com/redhat-developer/vscode-extension-tester) see
[Migration from VSCode Extension Tester](https://github.com/mlorinc/theia-extension-tester/wiki/Launching-VS-Code-Extension-Tester-tests) and [migration limitations](#limitation)

## <a name="limitation">Migration from VSCode Extension Tester limitation

[Some features and page objects are not fully compatible](support) in term of user interface with Eclipse Theia based editors.
Also some tests may libraries such as *fs*, *child_process* and other system specific libraries.
It is advised not to use system libraries when testing VS Code extensions to make tests less dependent on system / editor.

## Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) but until the project
reaches 100% compatibility with [VSCode Extension Tester](https://github.com/redhat-developer/vscode-extension-tester)
it will stay on 0.y.z and every change should be taken as breaking.
