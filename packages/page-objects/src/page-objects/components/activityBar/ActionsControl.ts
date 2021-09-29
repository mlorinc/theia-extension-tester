import { ActivityBar, ContextMenu, IActionsControl, IContextMenu, TheiaElement, WebElement } from "../../../module";

export class ActionsControl extends TheiaElement implements IActionsControl {
    constructor(element: WebElement, parent: ActivityBar) {
        super(element, parent);
    }

    openActionMenu(): Promise<IContextMenu> {
        return this.openContextMenu();
    }

    async getTitle(): Promise<string> {
        const fn = ActionsControl.locators.components.activityBar.action.constructor.properties?.title;

        if (fn) {
            return await fn(this, ActionsControl.locators);
        }
        else {
            throw new Error('ActionsControl.locators.components.activityBar.action.constructor.properties?.title is undefined');
        }
    }

    async openContextMenu(): Promise<IContextMenu> {
        await this.safeClick();
        return new ContextMenu();
    }
}
