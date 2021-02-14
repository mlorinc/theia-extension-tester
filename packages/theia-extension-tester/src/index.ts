export { SeleniumBrowser } from 'extension-tester-page-objects';
export * from 'selenium-webdriver';

export * from './browser';
export * from './runners/DashboardTestRunner';
export * from './runners/WorkspaceTestRunner';

export * from './page-objects/components/bottomBar/BottomBarPanel';

export * from './page-objects/components/editor/ContentAssist';
export * from './page-objects/components/editor/Editor';
export * from './page-objects/components/editor/EditorTab';
export * from './page-objects/components/editor/EditorView';
export * from './page-objects/components/editor/TextEditor';

export * from './page-objects/components/menu/ContextMenu';
export * from './page-objects/components/menu/Menu';
export * from './page-objects/components/menu/TitleBar';
export * from './page-objects/components/menu/WindowControls';

export * from './page-objects/components/sidebar/SideBarView';

export * from './page-objects/components/workbench/input/Input';

export * from './page-objects/theia-components/TheiaElement';

export * from './page-objects/theia-components/widgets/input/InputWidget';

export * from './page-objects/theia-components/widgets/list/ListItemWidget';
export * from './page-objects/theia-components/widgets/list/ListWidget';

export * from './page-objects/theia-components/widgets/scrollable/ScrollableWidget';

export * from './page-objects/theia-components/widgets/tabs/TabContentWidget';
export * from './page-objects/theia-components/widgets/tabs/TabWidget';
export * from './page-objects/theia-components/widgets/tabs/TabsWidget';

export * from './authenticator/Authenticator';
export * from './authenticator/OpenShiftAuthenticator';

export * from './locators/TheiaLocators';
