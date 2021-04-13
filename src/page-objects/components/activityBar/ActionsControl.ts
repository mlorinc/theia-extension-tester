import { IActionsControl, IMenu } from "extension-tester-page-objects";
import { WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { ContextMenu } from "../menu/ContextMenu";
import { ActivityBar } from "./ActivityBar";

export class ActionsControl extends TheiaElement implements IActionsControl {
    constructor(element: WebElement, parent: ActivityBar) {
        super(element, parent);
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

    async openContextMenu(): Promise<IMenu> {
        await this.safeClick();
        return new ContextMenu();
    }
}
