import { By } from "selenium-webdriver";
import { InputWidget } from "../../page-objects/theia-components/widgets/input/InputWidget";
import { ListItemWidget } from "../../page-objects/theia-components/widgets/list/ListItemWidget";
import { ListWidget } from "../../page-objects/theia-components/widgets/list/ListWidget";
import { ScrollableWidget } from "../../page-objects/theia-components/widgets/scrollable/ScrollableWidget";
import { TabsContentWidget } from "../../page-objects/theia-components/widgets/tabs/TabContentWidget";
import { TabsWidget } from "../../page-objects/theia-components/widgets/tabs/TabsWidget";
import { TabWidget } from "../../page-objects/theia-components/widgets/tabs/TabWidget";
import { Input } from "../../page-objects/components/workbench/input/Input";
import { hasClass, TheiaLocators } from "../TheiaLocators";
import { TitleBar } from "../../page-objects/components/menu/TitleBar";
import { ContextMenu } from "../../page-objects/components/menu/ContextMenu";
import { Editor } from "../../page-objects/components/editor/Editor";
import { EditorView } from "../../page-objects/components/editor/EditorView";

export const locators: TheiaLocators = {
    dashboard: {
        menu: {
            locator: By.id('page-sidebar')
        },
        getStarted: {
            mainSection: {
                locator: By.xpath(`.//*[${hasClass('pf-c-page__main')}]`)
            }
        }
    },
    widgets: {
        tabs: {
            locator: By.xpath(`.//*[${hasClass('pf-c-tabs')}]`),
            class: TabsWidget
        },
        tab: {
            locator: By.xpath(`.//*[${hasClass('pf-c-tabs__item')}]`),
            class: TabWidget,
            dependency: (locators) => locators.widgets.tabs
        },
        tabContent: {
            locator: By.xpath('.//md-tab-content'),
            class: TabsContentWidget,
            dependency: (locators) => locators.widgets.tabContent
        },
        list: {
            locator: By.xpath(`.//*[${hasClass('pf-c-nav')}]`),
            class: ListWidget
        },
        listItem: {
            locator: By.xpath(`.//*[${hasClass('pf-c-nav__item')}]`),
            class: ListItemWidget,
            dependency: (locators) => locators.widgets.list
        },
        input: {
            locator: By.xpath('.//input'),
            class: InputWidget
        }
    },
    components: {
        workbench: {
            input: {
                locator: By.xpath(`.//*[${hasClass('monaco-quick-open-widget')} and not(contains(@style, 'display: none'))]`),
                class: Input
            },
            quickPickContainer: {
                locator: By.xpath(`.//*[${hasClass('monaco-scrollable-element')}]`),
                class: ScrollableWidget,
                dependency: (locators) => locators.components.workbench.input
            }
        },
        menu: {
            titleBar: {
                locator: By.xpath('.//*[@id="theia:menubar"]'),
                class: TitleBar
            },
            titleBarItem: {
                locator: By.xpath(`.//*[${hasClass('p-MenuBar-item')}]`),
                class: ContextMenu,
                dependency: (locators) => locators.components.menu.titleBar
            },
            titleBarItemByLabel: {
                locator: ({ name }) => By.xpath(`.//*[${hasClass('p-MenuBar-item')} and .//*[${hasClass('p-MenuBar-itemLabel')} and text()="${name}"]]`)
            },
            titleBarItemLabel: {
                locator: ({ name }) => By.xpath(`.//*[${hasClass('p-MenuBar-itemLabel')} and text()="${name}"]`)
            },
            contextMenu: {
                locator: By.xpath(`.//*[${hasClass('p-Menu')}]`),
                class: ContextMenu
            },
            contextMenuItem: {
                locator: By.xpath(`.//*[${hasClass('p-Menu-item')}]`),
                class: ContextMenu,
                dependency: (locators) => locators.components.menu.contextMenu
            },
            contextMenuItemByLabel: {
                locator: ({ name }) => By.xpath(`.//*[${hasClass('p-Menu-item')} and .//*[${hasClass('p-Menu-itemLabel')} and text()="${name}"]]`)
            },
            contextMenuItemLabel: {
                locator: ({ name }) => By.xpath(`.//*[${hasClass('p-Menu-itemLabel')} and text()="${name}"]`)
            },
            label: {
                locator: By.xpath(`.//*[${hasClass('p-MenuBar-itemLabel')} or ${hasClass('p-Menu-itemLabel')}]`)
            }
        },
        editor: {
            editor: {
                locator: ({ fileUrl }) => By.xpath(`.//*[${hasClass('theia-editor')} and contains(@id, "${fileUrl}")]`),
                class: Editor,
                dependency: (locators) => locators.components.editor.editorView
            },
            activeEditor: {
                locator: By.xpath(`.//*[${hasClass('theia-editor')} and not(${hasClass('p-mod-hidden')})]`),
                class: Editor,
                dependency: (locators) => locators.components.editor.editorView
            },
            editorView: {
                locator: By.xpath('.//*[@id = "theia-main-content-panel"]'),
                class: EditorView
            },
            editorTab: {
                locator: By.xpath(`.//*[${hasClass('p-TabBar-tab')}]`),
                dependency: (locators) => locators.components.editor.editorView
            },
            editorTabByLabel: {
                locator: ({ title }) => By.xpath(`.//*[${hasClass('p-TabBar-tab')} and .//*[${hasClass('p-TabBar-tabLabel')} and text() = "${title}"]]`)
            },
            editorTabLabel: {
                locator: By.className('p-TabBar-tabLabel')
            },
            editorTabClose: {
                locator: By.className('p-TabBar-tabCloseIcon')
            },
            editorTabDirty: {
                locator: By.className('theia-mod-dirty')
            },
            contentAssist: {
                locator: By.xpath(`.//*[@widgetid = "editor.widget.suggestWidget"]`)
            },
            contentAssistMenuItem: {
                locator: By.className('monaco-list-row')
            },
            contentAssistMenuItemLabel: {
                locator: By.className('monaco-highlighted-label')
            },
            contentAssistMenuItemByLabel: {
                locator: ({ name }) => By.xpath(`.//*[${hasClass('monaco-list-row')} and .//*[${hasClass('monaco-highlighted-label')}]//*[text()="${name}"]]`)
            },
            contentAssistLoading: {
                locator: By.xpath(`.//*[${hasClass('message')} and text() = "loading"]`)
            },
            textEditorLines: {
                locator: By.className('view-lines')
            },
            textEditorLine: {
                locator: By.className('view-line')
            },
            textEditorLineQuery: {
                locator: ({ line }) => By.css(`.view-line:nth-child(${line})`)
            },
            textEditorBody: {
                locator: By.className('monaco-scrollable-element')
            }
        },
        bottomBar: {
            bottomBarPanel: {
                locator: By.id('theia-bottom-content-panel')
            },
            bottomBarPanelTabs: {
                locator: By.xpath(`.//*[${hasClass('p-TabBar-tab')}]`)
            },
            problemsViewCollapseAll: {
                locator: By.id('problems.collapse.all.toolbar')
            },
            problemsViewClearAll: {
                locator: By.id('problems.clear.all')
            }
        }
    }
}
