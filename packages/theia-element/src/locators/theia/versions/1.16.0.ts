import {
    By,
    TheiaElement,
    LocatorDiff,
    has
} from '../../..';

export const diff: LocatorDiff = {
    locators: {
        components: {
            workbench: {
                input: {
                    constructor: {
                        locator: By.className('quick-input-widget'),
                        properties: {
                            title: async (element: TheiaElement) => (await element.getEnclosingElement().findElement(By.className('quick-input-title'))).getText()
                        }
                    },
                    message: {
                        locator: By.id('quickInput_message')
                    }
                }
            },
            //@ts-ignore
            editor: {
                contentAssist: {
                    constructor: {
                        properties: {
                            displayed: has('class', 'visible')
                        }
                    }
                }
            }
        },
        widgets: {
            //@ts-ignore
            monacoScroll: {
                item: {
                    locator: By.css('[role="option"]')
                }
            }
        }
    }
}
