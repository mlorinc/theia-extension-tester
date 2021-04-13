import { By } from "selenium-webdriver";
import { InputWidget } from "../../../page-objects/theia-components/widgets/input/InputWidget";
import { ListItemWidget } from "../../../page-objects/theia-components/widgets/list/ListItemWidget";
import { ListWidget } from "../../../page-objects/theia-components/widgets/list/ListWidget";
import { ScrollableWidget } from "../../../page-objects/theia-components/widgets/scrollable/ScrollableWidget";
import { TabsContentWidget } from "../../../page-objects/theia-components/widgets/tabs/TabContentWidget";
import { TabsWidget } from "../../../page-objects/theia-components/widgets/tabs/TabsWidget";
import { TabWidget } from "../../../page-objects/theia-components/widgets/tabs/TabWidget";
import { Input } from "../../../page-objects/components/workbench/input/Input";
import { getAttribute, has, hasClass, hasNot, TheiaLocators, MonacoScrollLocator, getIntegerAttribute, attributeEquals } from "../../TheiaLocators";
import { TitleBar } from "../../../page-objects/components/menu/TitleBar";
import { ContextMenu } from "../../../page-objects/components/menu/ContextMenu";
import { Editor } from "../../../page-objects/components/editor/Editor";
import { EditorView } from "../../../page-objects/components/editor/EditorView";
import { TheiaElement } from "../../../page-objects/theia-components/TheiaElement";
import { ActivityBar } from "../../../page-objects/components/activityBar/ActivityBar";
import { ViewControl } from "../../../page-objects/components/activityBar/ViewControl";
import { ActionsControl } from "../../../page-objects/components/activityBar/ActionsControl";
import { SideBarView } from "../../../page-objects/components/sidebar/SideBarView";
import { TitleActionButton } from "../../../page-objects/components/sidebar/TitleActionButton";
import { ViewTitlePart } from "../../../page-objects/components/sidebar/ViewTitlePart";
import { ViewContent } from "../../../page-objects/components/sidebar/ViewContent";
import { ModalDialog } from "../../../page-objects/components/dialog/ModalDialog";
import { TitleBarItem } from "../../../page-objects/components/menu/TitleBarItem";
import { EditorTab } from "../../../page-objects/components/editor/EditorTab";

const MonacoScroll: MonacoScrollLocator = {
    constructor: {
        locator: By.className('monaco-scrollable-element'),
        class: ScrollableWidget
    },
    item: {
        locator: By.className('monaco-tree-row'),
        properties: {
            focused: has('class', 'focused'),
            selected: attributeEquals('aria-selected', 'true'),
            index: getIntegerAttribute('aria-posinset')
        }
    },
    verticalScroll: {
        constructor: {
            locator: By.className('slider')
        },
        container: {
            locator: By.css('.scrollbar.vertical')
        }
    },
    horizontalScroll: {
        constructor: {
            locator: By.className('slider')
        },
        container: {
            locator: By.css('.scrollbar.horizontal')
        }
    }
}

export const locators: TheiaLocators = {
    dashboard: {
        menu: {
            locator: By.id('page-sidebar')
        },
        getStarted: {
            mainSection: {
                locator: By.className('pf-c-page__main')
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
            dependency: (locators) => locators.widgets.tabs,
            properties: {
                selected: has('class', 'md-active')
            }
        },
        tabContent: {
            locator: By.xpath('.//md-tab-content'),
            class: TabsContentWidget,
            dependency: (locators) => locators.widgets.tabContent,
            properties: {
                selected: has('class', 'md-active')
            }
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
            locator: By.css('input'),
            class: InputWidget
        },
        tree: {
            constructor: {
                locator: By.className('theia-Tree')
            },
            yScroll: {
                locator: By.className('ps__thumb-y')
            },
            indent: {
                locator: By.className('theia-tree-node-indent')
            },
            node: {
                locator: By.className('theia-TreeNode'),
                properties: {
                    focused: has('class', 'theia-mod-focus'),
                    selected: has('class', 'theia-mod-selected'),
                    expandable: has('class', 'theia-ExpandableTreeNode')
                }
            },
            nodeWrapper: {
                locator: By.css('.ReactVirtualized__Grid__innerScrollContainer > div')
            },
            file: {
                expandToggle: {
                    locator: By.className('theia-ExpansionToggle'),
                    properties: {
                        collapsed: has('class', 'theia-mod-collapsed'),
                        enabled: hasNot('class', 'theia-mod-busy')
                    }
                },
                label: {
                    locator: By.css('.theia-TreeNodeSegment:not(.theia-ExpansionToggle)')
                }
            }
        },
        editorFrame: {
            locator: By.id('ide-iframe')
        },
        editorLoadedComponent: {
            locator: By.id('theia-left-right-split-panel')
        },
        monacoScroll: MonacoScroll
    },
    components: {
        activityBar: {
            constructor: {
                locator: By.className('theia-app-sidebar-container'),
                class: ActivityBar
            },
            container: {
                locator: By.id('theia-left-content-panel')
            },
            viewControl: {
                constructor: {
                    locator: By.css('.p-TabBar-content li'),
                    class: ViewControl,
                    properties: {
                        title: getAttribute('title'),
                        selected: has('class', 'p-mod-current'),
                        focused: has('class', 'theia-mod-active')
                    }
                }
            },
            action: {
                constructor: {
                    locator: By.css('.theia-sidebar-bottom-menu .codicon'),
                    class: ActionsControl,
                    properties: {
                        title: getAttribute('title')
                    }
                }
            }
        },
        dialog: {
            constructor: {
                locator: By.className('dialogBlock'),
                class: ModalDialog,
                properties: {
                    title: getAttribute('title', By.css('.dialogTitle div')),
                }
            },
            close: {
                locator: By.className('closeButton')
            },
            content: {
                details: {
                    locator: By.className('dialogContent')
                },
                message: {
                    locator: By.className('dialogContent')
                }
            },
            control: {
                button: {
                    locator: By.css('.dialogControl .theia-button'),
                    properties: {
                        enabled: hasNot('class', 'theia-mod-disabled'),
                        main: has('class', 'main'),
                        secondary: has('class', 'secondary')
                    }
                },
                error: {
                    locator: By.css('.dialogControl .error')
                }
            },
            navigationUp: {
                locator: By.className('theia-NavigationUp')
            }
        },
        workbench: {
            input: {
                constructor: {
                    locator: By.className('monaco-quick-open-widget'),
                    class: Input,
                    properties: {
                        title: async (element: TheiaElement) => (await element.getEnclosingElement().findElement(By.className('theia-quick-title-header'))).getText()
                    }
                },
                back: {
                    locator: By.xpath(`.//*[${hasClass('theia-quick-title-button')} and @title = 'Back']`)
                },
                error: {
                    locator: By.css('.monaco-inputbox.error')
                },
                message: {
                    locator: By.className('monaco-highlighted-label')
                },
                progress: {
                    locator: By.className('monaco-progress-container')
                },
                counter: {
                    locator: By.className('quick-open-result-count')
                },
                scroll: MonacoScroll,
                quickPickItem: {
                    description: {
                        locator: By.className('monaco-icon-description-container')
                    },
                    label: {
                        locator: By.className('label-name')
                    }
                }
            },
        },
        menu: {
            titleBar: {
                locator: By.id('theia:menubar'),
                class: TitleBar
            },
            titleBarItem: {
                locator: By.className('p-MenuBar-item'),
                class: TitleBarItem,
                dependency: (locators) => locators.components.menu.titleBar
            },
            contextMenu: {
                locator: By.className('p-Menu'),
                class: ContextMenu
            },
            contextMenuItem: {
                locator: By.className('p-Menu-item'),
                class: ContextMenu,
                dependency: (locators) => locators.components.menu.contextMenu,
                properties: {
                    expandable: async (element: TheiaElement) => await element.getAttribute('data-type') === 'submenu'
                }
            },
            label: {
                locator: By.css('.p-MenuBar-itemLabel, .p-Menu-itemLabel')
            }
        },
        editor: {
            constructor: {
                locator: By.className('p-DockPanel-widget'),
                class: Editor,
                dependency: (locators) => locators.components.editor.view,
                properties: {
                    focused: has('class', 'focused')
                }
            },
            cursor: {
                locator: By.className('inputarea')
            },
            tabBar: {
                constructor: {
                    locator: By.className('p-TabBar')
                },
                tab: {
                    constructor: {
                        locator: By.className('p-TabBar-tab'),
                        class: EditorTab,
                        properties: {
                            dirty: has('class', 'theia-mod-dirty'),
                            selected: has('class', 'p-mod-current'),
                            title: async (element: TheiaElement) => (await element.findElement(By.className('p-TabBar-tabLabel'))).getText(),
                        }
                    },
                    close: {
                        locator: By.className('p-TabBar-tabCloseIcon')
                    }
                }
            },
            view: {
                locator: By.id('theia-main-content-panel'),
                class: EditorView
            },
            contentAssist: {
                constructor: {
                    locator: By.className('suggest-widget'),
                },
                scroll: MonacoScroll,
                itemLabel: {
                    locator: By.className('monaco-highlighted-label')
                },
                loading: {
                    locator: By.xpath(`.//*[${hasClass('message')} and text() = "loading"]`)
                }
            },
            lines: {
                locator: By.className('view-lines')
            },
            line: {
                locator: By.className('view-line')
            },
            body: {
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
        },
        sideBar: {
            constructor: {
                locator: By.css('#theia-left-content-panel > :not(.theia-app-sidebar-container)'),
                class: SideBarView
            },
            tree: {
                default: {
                    constructor: {
                        locator: By.className('theia-FileTree')
                    },
                },
            },
            viewContent: {
                constructor: {
                    locator: By.id('theia-left-side-panel'),
                    class: ViewContent
                },
                progress: {
                    locator: By.className('theia-progress-bar')
                },
            },
            sections: {
                constructor: {
                    locator: By.className('p-DockPanel-widget')
                },
                section: {
                    body: {
                        locator: By.className('body')
                    },
                    constructor: {
                        locator: By.className('p-SplitPanel-child'),
                        properties: {
                            title: getAttribute(
                                'title',
                                (locators) => locators.components.sideBar.sections.section.header.constructor,
                                (locators) => locators.components.sideBar.sections.section.header.title,
                            ),
                            collapsed: has(
                                'class',
                                'theia-mod-collapsed',
                                (locators) => locators.components.sideBar.sections.section.header.constructor,
                                (locators) => locators.components.sideBar.sections.section.header.toggle,
                            )
                        }
                    },
                    header: {
                        constructor: {
                            locator: By.className('theia-header'),
                        },
                        title: {
                            locator: By.className('label')
                        },
                        toggle: {
                            locator: By.className('theia-ExpansionToggle'),
                            properties: {
                                enabled: hasNot('class', 'theia-mod-busy')
                            }
                        },
                        toolbar: {
                            constructor: {
                                locator: By.className('p-TabBar-toolbar')
                            },
                            action: {
                                locator: By.className('item'),
                                properties: {
                                    title: getAttribute('title', By.css('div')),
                                }
                            }
                        }
                    }
                }
            },
            viewTitlePart: {
                constructor: {
                    locator: By.className('theia-sidepanel-toolbar'),
                    class: ViewTitlePart,
                    properties: {
                        title: getAttribute('title', By.className('theia-sidepanel-title'))
                    }
                },
                action: {
                    constructor: {
                        locator: By.css('.p-TabBar-toolbar > .item > div'),
                        class: TitleActionButton,
                        properties: {
                            title: getAttribute('title')
                        }
                    }
                }
            }
        },
        statusBar: {
            constructor: {
                locator: By.id('theia-statusBar')
            }
        }
    }
}
