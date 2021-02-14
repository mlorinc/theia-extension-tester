import { By } from "selenium-webdriver";

export interface TheiaLocator {
    locator: By;
    class?: Object;
    dependency?: (locators: TheiaLocators) => TheiaLocator;
}

export interface TheiaLocatorQuery {
    locator: (args: { [key: string]: string }) => By;
    class?: Object;
    dependency?: (locators: TheiaLocators) => TheiaLocator;
}

export interface TheiaLocators {
    dashboard: {
        menu: TheiaLocator,
        getStarted: {
            mainSection: TheiaLocator
        }
    },
    widgets: {
        tabs: TheiaLocator,
        tab: TheiaLocator,
        tabContent: TheiaLocator;
        list: TheiaLocator;
        listItem: TheiaLocator;
        input: TheiaLocator;
    }
    components: {
        workbench: {
            input: TheiaLocator;
            quickPickContainer: TheiaLocator;
        },
        menu: {
            titleBar: TheiaLocator,
            titleBarItem: TheiaLocator,
            titleBarItemByLabel: TheiaLocatorQuery,
            titleBarItemLabel: TheiaLocatorQuery,
            contextMenu: TheiaLocator,
            contextMenuItem: TheiaLocator,
            contextMenuItemByLabel: TheiaLocatorQuery,
            contextMenuItemLabel: TheiaLocatorQuery,
            label: TheiaLocator
        },
        editor: {
            editor: TheiaLocatorQuery,
            activeEditor: TheiaLocator,
            editorView: TheiaLocator,
            editorTab: TheiaLocator,
            editorTabByLabel: TheiaLocatorQuery,
            editorTabLabel: TheiaLocator,
            editorTabClose: TheiaLocator,
            editorTabDirty: TheiaLocator,
            contentAssist: TheiaLocator,
            contentAssistMenuItem: TheiaLocator,
            contentAssistMenuItemLabel: TheiaLocator,
            contentAssistMenuItemByLabel: TheiaLocatorQuery,
            contentAssistLoading: TheiaLocator,
            textEditorLines: TheiaLocator,
            textEditorLine: TheiaLocator,
            textEditorLineQuery: TheiaLocatorQuery,
            textEditorBody: TheiaLocator
        },
        bottomBar: {
            bottomBarPanel: TheiaLocator,
            bottomBarPanelTabs: TheiaLocator,
            problemsViewCollapseAll: TheiaLocator,
            problemsViewClearAll: TheiaLocator
        }
    }
}

export function isTheiaLocator(object: any): boolean {
    if (object == null) {
        return false;
    }

    const keys = Object.keys(object);
    return keys.includes('locator');
}

export function hasClass(name: string) {
    return `contains(concat(' ',normalize-space(@class),' '),' ${name} ')`
}
