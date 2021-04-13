import { ActivityBar } from './ActivityBar';
import { Button, until, WebElement } from 'selenium-webdriver';
import { ContextMenu } from '../menu/ContextMenu';
import {
    getTimeout,
    IMenu,
    ISideBarView,
    IViewControl
} from 'extension-tester-page-objects';
import { SideBarView } from '../sidebar/SideBarView';
import { TheiaElement } from '../../theia-components/TheiaElement';

export class ViewControl extends TheiaElement implements IViewControl {
    constructor(element: WebElement, parent: ActivityBar) {
        super(element, parent);
    }
    async openView(): Promise<ISideBarView> {
        if (await this.isOpen() === false) {
            await this.safeClick();
            await this.getDriver().wait(until.elementIsVisible(new SideBarView()), getTimeout());
        }

        const sideBar = new SideBarView();
        const title = await this.getTitle();

        await sideBar.getDriver().wait(async () => {
            const titlePart = sideBar.getTitlePart();
            const contentTitle = await titlePart.getTitle();
            
            console.log(`"${contentTitle}".startsWith("${title}")`);
            return contentTitle.startsWith(title);
        }, getTimeout(), `Could not open view with title "${title}".`);

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
