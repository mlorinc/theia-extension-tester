import {
    HorizontalScrollWidget,
    INotification,
    INotificationsCenter,
    Notification,
    ScrollableWidget,
    ScrollWidget,
    TheiaElement,
    VerticalScrollWidget
} from '../../../module';

export class NotificationCenterScroll extends ScrollableWidget<Notification> {
    constructor(parent: INotificationsCenter) {
        super(NotificationCenterScroll.locators.components.workbench.notification.center.scroll.constructor, parent);
    }

    length(): Promise<number> {
        throw new Error("Method not implemented.");
    }

    protected async getItems(): Promise<Notification[]> {
        const notifications = await this.findElements(NotificationCenterScroll.locators.components.workbench.notification.constructor) as TheiaElement[];
        return await Promise.all(notifications.map((element) => new Notification(element, this)));
    }

    getActiveItem(): Promise<Notification> {
        throw new Error("Method not implemented.");
    }

    async findNotification(predicate: (notification: INotification) => PromiseLike<boolean> | boolean, timeout?: undefined): Promise<INotification> {
        await this.resetScroll();
        return await this.findItemSequentially(predicate, this.timeoutManager().findElementTimeout(timeout), 'Could not find notification');
    }

    protected async getVerticalScroll(): Promise<ScrollWidget> {
        const container = await this.findElement(NotificationCenterScroll.locators.components.workbench.notification.center.scroll.vertical.container) as TheiaElement;
        const component = await container.findElement(NotificationCenterScroll.locators.components.workbench.notification.center.scroll.vertical.constructor);
        return new VerticalScrollWidget(component, container);
    }
    protected async getHorizontalScroll(): Promise<ScrollWidget> {
        const container = await this.findElement(NotificationCenterScroll.locators.components.workbench.notification.center.scroll.horizontal.container) as TheiaElement;
        const component = await container.findElement(NotificationCenterScroll.locators.components.workbench.notification.center.scroll.horizontal.constructor);
        return new HorizontalScrollWidget(component, container);
    }

    protected async hasVerticalScroll(): Promise<boolean> {
        const scroll = await this.findElements(NotificationCenterScroll.locators.components.workbench.notification.center.scroll.vertical.constructor);
        return scroll.length === 1 && await scroll[0].isDisplayed();
    }
    protected async hasHorizontalScroll(): Promise<boolean> {
        const scroll = await this.findElements(NotificationCenterScroll.locators.components.workbench.notification.center.scroll.horizontal.constructor);
        return scroll.length === 1 && await scroll[0].isDisplayed();
    }
}
