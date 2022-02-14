import { repeat } from "@theia-extension-tester/repeat";
import { ActionsControl, IActionsControl, IActivityBar, IContextMenu, IViewControl, TheiaElement, ViewControl } from "../../../module";

export class ActivityBar extends TheiaElement implements IActivityBar {

    constructor() {
        super(ActivityBar.locators.components.activityBar.constructor, ActivityBar.locators.components.activityBar.container);
    }

    async getViewControls(): Promise<IViewControl[]> {
        const elements = await this.findElements(ActivityBar.locators.components.activityBar.viewControl.constructor);
        return elements.map((element) => new ViewControl(element, this));
    }

    async getViewControl(name: string): Promise<IViewControl> {
        return await repeat(async () => {
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
        }, {
            timeout: this.timeoutManager().findElementTimeout(),
            message: async () => `Could not find view control with title "${name}". Available controls: ${
                (await ViewControl.getTitles()).map((x) => `"${x}"`).join(', ')
            }
        `}) as ViewControl;
    }

    async getGlobalActions(): Promise<IActionsControl[]> {
        const elements = await this.findElements(ActivityBar.locators.components.activityBar.action.constructor);
        return elements.map((element) => new ActionsControl(element, this));
    }

    async getGlobalAction(name: string): Promise<IActionsControl> {
        return await repeat(async () => {
            const actions = await this.getGlobalActions();

            for (const action of actions) {
                if ((await action.getTitle()).includes(name)) {
                    return action;
                }
            }
            return undefined;
        }, {
            timeout: this.timeoutManager().findElementTimeout(),
            message: async () => `Could not find global action with title "${name}". Global actions: ${
                (await ActionsControl.getTitles()).map((x) => `"${x}"`).join(', ')
            }`
        }) as ActionsControl;
    }

    openContextMenu(): Promise<IContextMenu> {
        throw new Error('ActivityBar.openContextMenu is not supported in Eclipse Che.');
    }
}
