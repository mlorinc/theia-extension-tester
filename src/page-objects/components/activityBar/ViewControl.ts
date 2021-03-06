import {
    ActivityBar,
    Button,
    ContextMenu,
    getTimeout,
    IMenu,
    ISideBarView,
    IViewControl,
    SideBarView,
    TheiaElement,
    until,
    WebElement
} from '../../../module';

export class ViewControl extends TheiaElement implements IViewControl {
    constructor(element: WebElement, parent: ActivityBar) {
        super(element, parent);
    }
    async openView(): Promise<ISideBarView> {
        const sideBar = new SideBarView();

        if (await this.isOpen() === true) {
            return sideBar;
        }
        else {
            await this.safeClick();
            await this.getDriver().wait(until.elementIsVisible(new SideBarView()), getTimeout());
        }

        await sideBar.getDriver().wait(
            () => this.isOpen(),
            getTimeout(),
            `Could not open view with title "${await this.getTitle()}".`
        );

        return sideBar;
    }
    
    async closeView(): Promise<void> {
        if (await this.isOpen() === true) {
            await this.safeClick();
        }
        await this.getDriver().wait(async () => await this.isOpen() === false, getTimeout(), `Could not close view "${await this.getTitle()}".`);
    }

    async openContextMenu(): Promise<IMenu> {
        await this.safeClick(Button.RIGHT);
        return new ContextMenu();
    }

    protected async isOpen(): Promise<boolean> {
        return await this.isSelected() && await new SideBarView().isDisplayed();
    }
}
