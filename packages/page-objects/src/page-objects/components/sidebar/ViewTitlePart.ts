import {
    IMenu,
    ITitleActionButton,
    IViewTitlePart,
    SideBarView,
    TheiaElement,
    TitleActionButton
} from '../../../module';

export class ViewTitlePart extends TheiaElement implements IViewTitlePart {
    constructor(sideBar: SideBarView = new SideBarView()) {
        super(ViewTitlePart.locators.components.sideBar.viewTitlePart.constructor, sideBar);
    }

    async getActions(): Promise<ITitleActionButton[]> {
        const actions = await this.findElements(ViewTitlePart.locators.components.sideBar.viewTitlePart.action.constructor);
        return actions.map((action) => new TitleActionButton(action, this));
    }

    async getAction(title: string): Promise<ITitleActionButton> {
        return await this.getDriver().wait(async () => {
            const actions = await this.getActions();

            for (const action of actions) {
                if (await action.getTitle() === title) {
                    return action;
                }
            }

            return undefined;
        }, this.timeoutManager().findElementTimeout(), `Could not find action button with title "${title}".`) as TitleActionButton;
    }

    openContextMenu(): Promise<IMenu> {
        throw new Error('ViewTitlePart.openContextMenu is not supported in Eclipse Che.');
    }
}
