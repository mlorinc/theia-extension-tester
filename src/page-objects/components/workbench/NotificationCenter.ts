import {
    getTimeout,
    INotification,
    INotificationsCenter,
    Notification,
    NotificationCenterScroll,
    NotificationType,
    repeat,
    TheiaElement
} from '../../../module';

export class NotificationCenter extends TheiaElement implements INotificationsCenter {
    constructor() {
        super(NotificationCenter.locators.components.workbench.notification.center.constructor);
    }

    async close(): Promise<void> {
        await repeat(async () => {
            if (await NotificationCenter.isOpen() === false) {
                return true;
            }

            try {
                // safe click does not work well in this scenario
                const close = await this.findElement(NotificationCenter.locators.components.workbench.notification.center.close) as TheiaElement;
                await close.click();
            }
            catch (e) {
                if (e.message.includes('element not interactable') || e.message.includes('element click intercepted')) {
                    return false;
                }
                throw e;
            }

            return false;
        }, {
            timeout: getTimeout(),
            message: 'Could not close notification center.'
        });
    }

    async clearAllNotifications(): Promise<void> {
        if (await NotificationCenter.isOpen() === false) {
            throw new Error('Cannot clear notifications. Notification center is closed.');
        }

        const clearAll = await this.findElement(NotificationCenter.locators.components.workbench.notification.center.clearAll) as TheiaElement;
        
        await repeat(async () => {
            if (await NotificationCenter.isOpen() === false) {
                return true;
            }

            if (await clearAll.isEnabled() === false) {
                return true;
            }

            try {
                await clearAll.click();
            }
            catch (e) {
                if (e.message.includes('element not interactable') || e.message.includes('element click intercepted')) {
                    return false;
                }
                throw e;
            }

            return false;
        }, {
            timeout: getTimeout(),
            message: 'Could not clear notification center'
        });
    }

    async getNotifications(type: NotificationType = NotificationType.Any): Promise<INotification[]> {
        const scroll = new NotificationCenterScroll(this);
        const notifications = await scroll.getVisibleItems();
        return await Notification.filterNotifications(this, notifications, type);
    }

    static async isOpen(): Promise<boolean> {
        const center = new NotificationCenter();
        return await center.isDisplayed();
    }
}
