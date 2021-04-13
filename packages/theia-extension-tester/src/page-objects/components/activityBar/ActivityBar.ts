import { ActionsControl } from './ActionsControl';
import {
    getTimeout,
    IActionsControl,
    IActivityBar,
    IMenu,
    IViewControl
} from 'extension-tester-page-objects';
import { TheiaElement } from '../../theia-components/TheiaElement';
import { ViewControl } from './ViewControl';

export class ActivityBar extends TheiaElement implements IActivityBar {

    constructor() {
        super(ActivityBar.locators.components.activityBar.constructor, ActivityBar.locators.components.activityBar.container);
    }

    async getViewControls(): Promise<IViewControl[]> {
        const elements = await this.findElements(ActivityBar.locators.components.activityBar.viewControl.constructor);
        return elements.map((element) => new ViewControl(element, this));
    }

    async getViewControl(name: string): Promise<IViewControl> {
        return await this.getDriver().wait(async () => {
            const controls = await this.getViewControls();

            try {
                for (const control of controls) {
                    const controlTitle = await control.getTitle();
                    if (controlTitle.startsWith(name)) {
                        return control;
                    }
                }
                return undefined;
            }
            catch (e) {
                console.error(e);
                return undefined;
            }
        }, getTimeout(), `Could not find view control with title "${name}".`) as ViewControl;
    }

    async getGlobalActions(): Promise<IActionsControl[]> {
        const elements = await this.findElements(ActivityBar.locators.components.activityBar.action.constructor);
        return elements.map((element) => new ActionsControl(element, this));
    }

    async getGlobalAction(name: string): Promise<IActionsControl> {
        return await this.getDriver().wait(async () => {
            const actions = await this.getGlobalActions();

            for (const action of actions) {
                if ((await action.getTitle()).includes(name)) {
                    return action;
                }
            }
            return undefined;
        }, getTimeout(), `Could not find view control with title "${name}".`) as ActionsControl;
    }

    openContextMenu(): Promise<IMenu> {
        throw new Error('ActivityBar.openContextMenu is not supported in Eclipse Che.');
    }
}
