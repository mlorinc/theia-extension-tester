import { By, Locator } from "extension-tester-page-objects";
import { TheiaElement } from "..";
import { LocatorDiff as Diff } from "@theia-extension-tester/locator-loader";

export interface TheiaLocator {
    locator: Locator;
    class?: Object;
    dependency?: (locators: TheiaLocators) => TheiaLocator;
    properties?: TheiaLocatorProperties
}

export type PropertyGetter<T> = (element: TheiaElement, locators: TheiaLocators) => Promise<T>

export type TheiaLocatorProperty =
    'collapsed' | 'dirty' | 'displayed' | 'enabled' | 'expandable' | 'focused' | 'index' | 'main' | 'secondary' | 'selected' | 'title';

export interface TheiaLocatorProperties {
    collapsed?: PropertyGetter<boolean>;
    dirty?: PropertyGetter<boolean>;
    displayed?: PropertyGetter<boolean>;
    enabled?: PropertyGetter<boolean>;
    expandable?: PropertyGetter<boolean>;
    focused?: PropertyGetter<boolean>;
    index?: PropertyGetter<number>;
    main?: PropertyGetter<boolean>;
    secondary?: PropertyGetter<boolean>;
    selected?: PropertyGetter<boolean>;
    title?: PropertyGetter<string>;
}

export interface TheiaLocatorQuery {
    locator: (args: { [key: string]: string }) => By;
    class?: Object;
    dependency?: (locators: TheiaLocators) => TheiaLocator;
}

type ElementPath = TheiaElement | Locator | TheiaLocator | ((locators: TheiaLocators) => TheiaLocator);

async function getElementFromPath(element: TheiaElement, locators: TheiaLocators, path: Array<ElementPath>): Promise<TheiaElement> {
    for (const item of path) {
        if (item instanceof TheiaElement) {
            element = item;
        }
        else if (item instanceof Function) {
            element = await element.findElement(item(locators)) as TheiaElement;
        }
        else {
            element = await element.findElement(item) as TheiaElement;
        }
    }
    return element;
}

export function has(attribute: string, value: string, ...path: Array<ElementPath>): PropertyGetter<boolean> {
    return async (element: TheiaElement, locators: TheiaLocators) => {
        element = await getElementFromPath(element, locators, path);
        return (await element.getAttribute(attribute)).includes(value);
    };
}

export function hasNot(attribute: string, value: string, ...path: Array<ElementPath>): PropertyGetter<boolean> {
    return async (element: TheiaElement, locators: TheiaLocators) => {
        element = await getElementFromPath(element, locators, path);
        return (await element.getAttribute(attribute)).includes(value) === false
    };
}

export function getAttribute(attribute: string, ...path: Array<ElementPath>) {
    return async (element: TheiaElement, locators: TheiaLocators) => {
        element = await getElementFromPath(element, locators, path);
        return await element.getAttribute(attribute);
    };
}

export function getIntegerAttribute(attribute: string, ...path: Array<ElementPath>) {
    return async (element: TheiaElement, locators: TheiaLocators) => {
        element = await getElementFromPath(element, locators, path);
        return Number.parseInt(await element.getAttribute(attribute));
    };
}

export function attributeEquals<T>(attribute: string, comparator: any | ((value: T) => PromiseLike<boolean>), ...path: Array<ElementPath>) {
    return async(element: TheiaElement, locators: TheiaLocators) => {
        const attributeGetter = getAttribute(attribute, path);
        const attributeValue = await attributeGetter(element, locators);

        if (typeof comparator === 'function') {
            return await comparator(attributeValue);
        }
        else {
            return attributeValue === comparator;
        }
    };
}

export interface MonacoScrollLocator {
    constructor: TheiaLocator;
    item: TheiaLocator;
    verticalScroll: {
        constructor: TheiaLocator,
        container: TheiaLocator
    }
    horizontalScroll: {
        constructor: TheiaLocator,
        container: TheiaLocator
    }
}

/**
 * Definition for locator diff object
 */
export interface LocatorDiff extends Diff<TheiaLocators> {}

export interface TheiaLocators {
    dashboard: {
        menu: TheiaLocator,
        getStarted: {
            mainSection: TheiaLocator
        },
        cheChevron: TheiaLocator;
    },
    widgets: {
        tabs: TheiaLocator,
        tab: TheiaLocator,
        tabContent: TheiaLocator;
        list: TheiaLocator;
        listItem: TheiaLocator;
        input: TheiaLocator;
        tree: {
            constructor: TheiaLocator,
            yScroll: TheiaLocator,
            indent: TheiaLocator,
            node: TheiaLocator,
            nodeWrapper: TheiaLocator,
            file: {
                expandToggle: TheiaLocator,
                label: TheiaLocator
            }
        },
        editorFrame: TheiaLocator;
        editorLoadedComponent: TheiaLocator;
        monacoScroll: MonacoScrollLocator;
    }
    components: {
        activityBar: {
            constructor: TheiaLocator,
            container: TheiaLocator,
            viewControl: {
                constructor: TheiaLocator,
            },
            action: {
                constructor: TheiaLocator,
            }
        },
        dialog: {
            constructor: TheiaLocator,
            content: {
                message: TheiaLocator,
                details: TheiaLocator
            }
            control: {
                button: TheiaLocator,
                error: TheiaLocator
            }
            close: TheiaLocator,
            navigationUp: TheiaLocator
        }
        workbench: {
            input: {
                back: TheiaLocator,
                constructor: TheiaLocator,
                error: TheiaLocator,
                field: TheiaLocator,
                message: TheiaLocator,
                progress: TheiaLocator,
                counter: TheiaLocator,
                scroll: MonacoScrollLocator
                quickPickItem: {
                    description: TheiaLocator,
                    label: TheiaLocator
                }
            },
            notification: {
                constructor: TheiaLocator
                icon: TheiaLocator,
                source: TheiaLocator,
                progress: TheiaLocator,
                close: TheiaLocator,
                action: TheiaLocator,
                center: {
                    constructor: TheiaLocator,
                    close: TheiaLocator,
                    clearAll: TheiaLocator,
                    scroll: {
                        constructor: TheiaLocator,
                        vertical: {
                            constructor: TheiaLocator,
                            container: TheiaLocator
                        }
                        horizontal: {
                            constructor: TheiaLocator,
                            container: TheiaLocator
                        }
                    }
                }
                standalone: {
                    constructor: TheiaLocator,
                }
            }
        }
        menu: {
            titleBar: TheiaLocator,
            titleBarItem: TheiaLocator,
            contextMenu: TheiaLocator,
            contextMenuItem: TheiaLocator,
            label: TheiaLocator
        },
        editor: {
            constructor: TheiaLocator,
            cursor: TheiaLocator,
            view: TheiaLocator,
            tabBar: {
                constructor: TheiaLocator,
                tab: {
                    constructor: TheiaLocator,
                    close: TheiaLocator
                }
            },
            contentAssist: {
                constructor: TheiaLocator;
                scroll: MonacoScrollLocator;
                itemLabel: TheiaLocator;
                loading: TheiaLocator
            }
            lines: TheiaLocator,
            line: TheiaLocator,
            body: TheiaLocator
        },
        bottomBar: {
            bottomBarPanel: TheiaLocator,
            bottomBarPanelTabs: TheiaLocator,
            problemsViewCollapseAll: TheiaLocator,
            problemsViewClearAll: TheiaLocator
        },
        sideBar: {
            constructor: TheiaLocator,
            tree: {
                default: {
                    constructor: TheiaLocator
                },
            },
            viewContent: {
                constructor: TheiaLocator,
                progress: TheiaLocator
            },
            sections: {
                constructor: TheiaLocator,
                section: {
                    body: TheiaLocator,
                    constructor: TheiaLocator,
                    header: {
                        constructor: TheiaLocator
                        title: TheiaLocator,
                        toggle: TheiaLocator,
                        toolbar: {
                            constructor: TheiaLocator
                            action: TheiaLocator
                        }
                    }
                }
            }
            viewTitlePart: {
                constructor: TheiaLocator,
                action: {
                    constructor: TheiaLocator
                }
            }
        },
        statusBar: {
            constructor: TheiaLocator,
            openNotificationCenter: TheiaLocator
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
