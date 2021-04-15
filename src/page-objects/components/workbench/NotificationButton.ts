import { TheiaElement, INotification, INotificationButton } from "../../../module";

export class NotificationButton extends TheiaElement implements INotificationButton {
    constructor(element: TheiaElement, parent: INotification) {
        super(element, parent);
    }
}
