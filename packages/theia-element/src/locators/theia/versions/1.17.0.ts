import {
    By,
    LocatorDiff
} from '../../..';

export const diff: LocatorDiff = {
    locators: {
        components: {
            //@ts-ignore
            activityBar: {
                action: {
                    constructor: {
                        locator: By.css('.theia-sidebar-menu .codicon'),
                    }
                }
            },
            workbench: {
                notification: {
                    //@ts-ignore
                    center: {
                        clearAll: {
                            locator: By.xpath(`.//li[@title="Clear All"]`)
                        },
                        close: {
                            locator: By.xpath(`.//li[@title="Hide Notification Center"]`)
                        }
                    },
                    close: {
                        locator: By.xpath(`.//li[@title="Clear"]`)
                    }
                }
            }
        }
    }
}
