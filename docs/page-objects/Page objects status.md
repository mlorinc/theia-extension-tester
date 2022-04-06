Currently the project supports subset of page objects used by [VSCode Extension Tester](https://github.com/redhat-developer/vscode-extension-tester).
Some page object functionality might not be supported forever because user interface differences between VS Code
and Eclipse Theia editors.

### Current status of page objects

| Page object              |           Status           |
|--------------------------|:--------------------------:|
| ActivityBar              |          supported         |
|  - ViewControl           |          supported         |
| ContextMenu              |          supported         |
|  - ContextMenuItem       |          supported         |
| EditorView               |          supported         |
|  - EditorGroup           |          supported         |
|  - TextEditor            |          supported         |
|    -- ContentAssist      |          supported         |
| ProblemsView             |       not implemented      |
| SideBarView              |          supported         |
|  - ViewTitlePart         |          supported         |
|  - ViewContent           |          supported         |
|  - ViewSection           |          supported         |
|    -- CustomTreeSection  |       not implemented      |
|    -- DefaultTreeSection | unsupported (experimental) |
| Workbench                |          supported         |
|  - Input                 |          supported         |
|  - Notification          |          supported         |
|  - NotificationCenter    |          supported         |
| BottomBarPanel           |       not implemented      |
|  - DebugConsoleView      |       not implemented      |
|  - DebugView             |       not implemented      |
|  - TerminalView          |       not implemented      |
| DiffEditor               |       not implemented      |
| ScmView                  |       not implemented      |
| SettingsEditor           |       not implemented      |
|  - Setting               |       not implemented      |
| StatusBar                |       not implemented      |
| TitleBar                 |          supported         |
|  - TitleBarItem          |          supported         |
| ExtensionViewSection     |       not implemented      |
| WebView                  |       not implemented      |
| WindowControls           |         unsupported        |

> supported = compatible with VS Code Extension Tester and functional
>
> not implemented = not functional 
>
> unsupported = some functionality is present but it is incompatible with VS Code Extension Tester or experimental API is present