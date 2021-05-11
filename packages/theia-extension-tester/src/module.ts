export * from 'extension-tester-page-objects';
export * from 'selenium-webdriver';
export { Options as ChromeOptions } from 'selenium-webdriver/chrome';
export { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
export { Options as OperaOptions } from 'selenium-webdriver/opera';
export { Options as SafariOptions } from 'selenium-webdriver/safari';

/** Theia widgets */

export { TheiaLocatorLoader } from './LocatorLoader';
export * from './page-objects/theia-components/TheiaElement';
export * from './locators/TheiaLocators';

export * from './page-objects/theia-components/widgets/input/InputWidget';
export * from './page-objects/theia-components/widgets/list/ListWidget';
export * from './page-objects/theia-components/widgets/list/ListItemWidget';

export * from './page-objects/theia-components/widgets/scrollable/Scroll';
export * from './page-objects/theia-components/widgets/scrollable/ScrollableWidget';
export * from './page-objects/theia-components/widgets/scrollable/MonacoScrollWidget';

export * from './page-objects/theia-components/widgets/tabs/TabsWidget';
export * from './page-objects/theia-components/widgets/tabs/TabWidget';
export * from './page-objects/theia-components/widgets/tabs/TabContentWidget';

export * from './page-objects/theia-components/widgets/tree/TreeWidget';
export * from './page-objects/theia-components/widgets/tree/TreeNode';
export * from './page-objects/theia-components/widgets/tree/FileTreeWidget';
export * from './page-objects/theia-components/widgets/tree/FileTreeNode';

/** End of Theia widgets */

export * from './browsers/BaseBrowser';
export * from './browsers/TheiaBrowser';
export * from './browsers/CheTheiaBrowser';
export * from './browsers/TheiaElectronBrowser';
export * from './runners/MochaRunner';
export * from './runners/TheiaBrowserRunner';
export * from './runners/CheTheiaFactoryRunner';
export * from './runners/WorkspaceTestRunner';

export * from './page-objects/components/activityBar/ActionsControl';
export * from './page-objects/components/activityBar/ActivityBar';
export * from './page-objects/components/activityBar/ViewControl';

export * from './page-objects/components/bottomBar/BottomBarPanel';
export * from './page-objects/components/bottomBar/TextView';
export * from './page-objects/components/bottomBar/DebugConsoleView';
export * from './page-objects/components/bottomBar/OutputView';
export * from './page-objects/components/bottomBar/TerminalView';

export * from './page-objects/components/dialog/DialogHandler';
export * from './page-objects/components/dialog/ModalDialog';
export * from './page-objects/components/dialog/OpenDialog';

export * from './page-objects/components/menu/Menu';
export * from './page-objects/components/menu/MenuItem';
export * from './page-objects/components/menu/ContextMenu';
export * from './page-objects/components/menu/ContextMenuItem';
export * from './page-objects/components/menu/TitleBar';
export * from './page-objects/components/menu/TitleBarItem';
export * from './page-objects/components/menu/WindowControls';

export * from './page-objects/components/editor/ContentAssist';
export * from './page-objects/components/editor/ContentAssistItem';
export * from './page-objects/components/editor/Editor';
export * from './page-objects/components/editor/EditorGroup';
export * from './page-objects/components/editor/EditorTab';
export * from './page-objects/components/editor/EditorView';
export * from './page-objects/components/editor/TextEditor';
export * from './page-objects/components/editor/SettingsEditor';
export * from './page-objects/components/editor/MiniBrowserEditor';
export * from './page-objects/components/editor/TheiaEditorPreview';
export * from './page-objects/components/editor/WebviewEditor';

export * from './page-objects/components/sidebar/SideBarView';
export * from './page-objects/components/sidebar/TitleActionButton';
export * from './page-objects/components/sidebar/ViewContent';
export * from './page-objects/components/sidebar/ViewItem';
export * from './page-objects/components/sidebar/ViewPanelAction';
export * from './page-objects/components/sidebar/ViewSection';
export * from './page-objects/components/sidebar/DefaultViewSection';
export * from './page-objects/components/sidebar/ViewTitlePart';

export * from './page-objects/components/sidebar/tree/custom/CustomTreeItem';
export * from './page-objects/components/sidebar/tree/custom/CustomTreeSection';
export * from './page-objects/components/sidebar/tree/default/DefaultTreeItem';
export * from './page-objects/components/sidebar/tree/default/DefaultTreeSection';
export * from './page-objects/components/dialog/DialogTree';

export * from './page-objects/components/statusBar/StatusBar';

export * from './page-objects/components/workbench/Workbench';
export * from './page-objects/components/workbench/input/Input';
export * from './page-objects/components/workbench/input/QuickPickItem';
export * from './page-objects/components/workbench/input/QuickPickScroller';
export * from './page-objects/components/workbench/NotificationButton';
export * from './page-objects/components/workbench/Notification';
export * from './page-objects/components/workbench/NotificationCenterScroll';
export * from './page-objects/components/workbench/NotificationCenter';

export * from './authenticator/Authenticator';
export * from './authenticator/OpenShiftAuthenticator';

export * from './page-objects/components/dialog/ModalDialogButton';
