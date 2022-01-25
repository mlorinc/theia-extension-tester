import { By } from "extension-tester-page-objects";

import {
    attributeEquals,
    getAttribute,
    getIntegerAttribute,
    has,
    hasClass,
    hasNot,
    MonacoScrollLocator,
    TheiaLocators
} from '../../..';

const MonacoScroll: MonacoScrollLocator = {
    constructor: {
        locator: By.className('monaco-scrollable-element')
    },
    item: {
        locator: By.css('[role="treeitem"]'),
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
        },
        cheChevron: {
            locator: By.className('che-dashboard')
        }
    },
    widgets: {
        tabs: {
            locator: By.xpath(`.//*[${hasClass('pf-c-tabs')}]`)
        },
        tab: {
            locator: By.xpath(`.//*[${hasClass('pf-c-tabs__item')}]`),
            dependency: (locators) => locators.widgets.tabs,
            properties: {
                selected: has('class', 'md-active')
            }
        },
        tabContent: {
            locator: By.xpath('.//md-tab-content'),
            dependency: (locators) => locators.widgets.tabContent,
            properties: {
                selected: has('class', 'md-active')
            }
        },
        list: {
            locator: By.xpath(`.//*[${hasClass('pf-c-nav')}]`),
        },
        listItem: {
            locator: By.xpath(`.//*[${hasClass('pf-c-nav__item')}]`),
            dependency: (locators) => locators.widgets.list
        },
        input: {
            locator: By.css('input'),
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
                    expandable: has('class', 'theia-ExpandableTreeNode'),
                    enabled: hasNot('class', 'theia-mod-busy')
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
        monacoScroll: {
            constructor: {
                locator: By.className('monaco-scrollable-element')
            },
            item: {
                locator: By.css('[role="treeitem"]'),
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
    },
    components: {
        activityBar: {
            constructor: {
                locator: By.className('theia-app-sidebar-container'),
            },
            container: {
                locator: By.id('theia-left-content-panel')
            },
            viewControl: {
                constructor: {
                    locator: By.css('.p-TabBar-content li'),
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
                    properties: {
                        title: getAttribute('title')
                    }
                }
            }
        },
        dialog: {
            constructor: {
                locator: By.className('dialogBlock'),
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
                locator: By.className('theia-NavigationUp'),
                properties: {
                    enabled: hasNot('class', 'theia-mod-disabled')
                }
            }
        },
        workbench: {
            input: {
                constructor: {
                    locator: By.className('quick-input-widget'),
                    properties: {
                        title: async (element) => (await element.getEnclosingElement().findElement(By.className('quick-input-title'))).getText(),
                        focused: has('class', 'synthetic-focus', By.className('monaco-inputbox'))
                    }
                },
                back: {
                    locator: By.xpath(`.//*[${hasClass('theia-quick-title-button')} and @title = 'Back']`)
                },
                error: {
                    locator: By.css('.monaco-inputbox.error')
                },
                field: {
                    locator: By.className('input')
                },
                message: {
                    locator: By.className('monaco-highlighted-label')
                },
                progress: {
                    locator: By.className('monaco-progress-container'),
                    properties: {
                        enabled: has('class', 'done')
                    }
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
            notification: {
                constructor: {
                    locator: By.className('theia-notification-list-item'),
                    properties: {
                        title: getAttribute('innerText', By.className('theia-notification-message'))
                    },
                },
                action: {
                    locator: By.css('.theia-notification-buttons > .theia-button'),
                    properties: {
                        title: getAttribute('innerText')
                    }
                },
                close: {
                    locator: By.className('clear')
                },
                icon: {
                    locator: By.className('theia-notification-icon')
                },
                progress: {
                    locator: By.className('theia-notification-item-progressbar')
                },
                source: {
                    locator: By.className('theia-notification-source')
                },
                center: {
                    constructor: {
                        locator: By.className('theia-notification-center')
                    },
                    clearAll: {
                        locator: By.className('clear-all')
                    },
                    close: {
                        locator: By.className('collapse')
                    },
                    scroll: {
                        constructor: {
                            locator: By.className('scrollbar-container')
                        },
                        vertical: {
                            container: {
                                locator: By.className('ps__rail-y')
                            },
                            constructor: {
                                locator: By.className('ps__thumb-y')
                            }
                        },
                        horizontal: {
                            container: {
                                locator: By.className('ps__rail-x')
                            },
                            constructor: {
                                locator: By.className('ps__thumb-x')
                            }
                        }
                    }
                },
                standalone: {
                    constructor: {
                        locator: By.className('theia-notification-toasts')
                    }
                }
            }
        },
        menu: {
            titleBar: {
                locator: By.id('theia:menubar'),
            },
            titleBarItem: {
                locator: By.className('p-MenuBar-item'),
                dependency: (locators) => locators.components.menu.titleBar
            },
            contextMenu: {
                locator: By.className('p-Menu'),
            },
            contextMenuItem: {
                locator: By.className('p-Menu-item'),
                dependency: (locators) => locators.components.menu.contextMenu,
                properties: {
                    expandable: async (element) => await element.getAttribute('data-type') === 'submenu'
                }
            },
            label: {
                locator: By.css('.p-MenuBar-itemLabel, .p-Menu-itemLabel')
            }
        },
        editor: {
            constructor: {
                locator: By.className('p-DockPanel-widget'),
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
                        properties: {
                            dirty: has('class', 'theia-mod-dirty'),
                            selected: has('class', 'p-mod-current'),
                            title: async (element) => (await element.findElement(By.className('p-TabBar-tabLabel'))).getText(),
                        }
                    },
                    close: {
                        locator: By.className('p-TabBar-tabCloseIcon')
                    }
                }
            },
            view: {
                locator: By.id('theia-main-content-panel'),
            },
            contentAssist: {
                constructor: {
                    locator: By.className('suggest-widget')
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
                    properties: {
                        title: getAttribute('title', By.className('theia-sidepanel-title'))
                    }
                },
                action: {
                    constructor: {
                        locator: By.css('.p-TabBar-toolbar > .item > div'),
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
            },
            openNotificationCenter: {
                locator: By.xpath(`.//*[${hasClass('hasCommand')} and contains(@title, 'Notification')]`)
            }
        }
    }
}
