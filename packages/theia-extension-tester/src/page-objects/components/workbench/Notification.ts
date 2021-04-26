import {
    getTimeout,
    ICenterNotification,
    IMenu,
    INotification,
    INotificationButton,
    IStandaloneNotification,
    NotificationButton,
    NotificationType,
    repeat,
    TheiaElement,
    until
} from '../../../module';

export class Notification extends TheiaElement implements INotification, ICenterNotification, IStandaloneNotification {
    constructor(element: TheiaElement, parent: TheiaElement) {
        super(element, parent);
    }

    getMessage(): Promise<string> {
        return this.getTitle();
    }

    async getType(): Promise<NotificationType> {
        const icon = await this.findElements(Notification.locators.components.workbench.notification.icon);

        if (icon.length === 0) {
            return NotificationType.Any;
        }

        const classes = await icon[0].getAttribute('class');

        if (classes.includes('info')) {
            return NotificationType.Info;
        }
        if (classes.includes('error')) {
            return NotificationType.Error;
        }
        if (classes.includes('warning')) {
            return NotificationType.Warning;
        }

        return NotificationType.Any;
    }

    async getSource(): Promise<string> {
        const element = await this.findElements(Notification.locators.components.workbench.notification.source);
        return element.length > 0 ? await element[0].getText() : '';
    }

    async hasProgress(): Promise<boolean> {
        const elements = await this.findElements(Notification.locators.components.workbench.notification.progress);
        return elements.length > 0 && await elements[0].isDisplayed();
    }

    async dismiss(): Promise<void> {
        const element = await this.findElement(Notification.locators.components.workbench.notification.close) as TheiaElement;
        await element.safeClick();
        await this.getDriver().wait(until.stalenessOf(this), getTimeout());
    }

    async getActions(): Promise<INotificationButton[]> {
        const elements = await this.findElements(Notification.locators.components.workbench.notification.action) as TheiaElement[];
        return Promise.all(elements.map((element) => new NotificationButton(element, this)));
    }

    async takeAction(title: string): Promise<void> {
        await repeat(async () => {
            const actions = await this.getActions();

            for (const action of actions) {
                if (await action.getTitle() === title) {
                    await action.safeClick();
                    return action;
                }
            }
            return undefined;
        }, {
            timeout: getTimeout(),
            message: `Could not find action with title "${title}".`
        });
    }

    openContextMenu(): Promise<IMenu> {
        throw new Error("This action is not supported in Eclipse Che.");
    }

    static async filterNotifications(parent: TheiaElement, notifications: Notification[], type: NotificationType): Promise<INotification[]> {
        if (type === NotificationType.Any) {
            return await Promise.all(notifications.map((element) => new Notification(element, parent)));
        }

        const outNotifications: INotification[] = [];
        for (const notification of notifications) {
            const notificationComponent = new Notification(notification, parent);

            if (await notificationComponent.getType() === type) {
                outNotifications.push(notificationComponent);
            }
        }

        return outNotifications;
    }
}
