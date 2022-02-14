import { repeat } from '@theia-extension-tester/repeat';
import { TimeoutPromise } from '@theia-extension-tester/timeout-promise';
import {
    ActivityBar,
    Button,
    ContextMenu,
    ElementRepeatAction,
    IContextMenu,
    ISideBarView,
    IViewControl,
    SideBarView,
    TheiaElement,
    WebElement
} from '../../../module';

export class ViewControl extends TheiaElement implements IViewControl {
    constructor(element: WebElement, parent: ActivityBar) {
        super(element, parent);
    }

    async openView(): Promise<ISideBarView> {
        const action = new ElementRepeatAction(this, 2000);
        return await repeat(async () => {
            const sideBarView = new SideBarView();
            if (await this.isOpen(sideBarView) === true) {
                return sideBarView;
            }
            await action.click();
            return undefined;
        }, {
            timeout: this.timeoutManager().defaultTimeout(),
            message: `Could not open view with title "${await this.getTitle()}".`
        }) as ISideBarView;
    }

    async closeView(): Promise<void> {
        const action = new ElementRepeatAction(this, 2000);
        await repeat(async () => {
            if (await this.isOpen() === false) {
                return true;
            }
            await action.click();
            return false;
        }, {
            timeout: this.timeoutManager().defaultTimeout(),
            message: `Could not close view "${await this.getTitle()}".`
        });
    }

    async openContextMenu(): Promise<IContextMenu> {
        return await repeat(async () => {
            await this.safeClick(Button.RIGHT);
            // make sure menu is ready, if not right click might have been blocked
            const menu = new ContextMenu();

            if (await TimeoutPromise.createFrom(menu.isDisplayed(), 1000).catch(() => undefined)) {
                return menu;
            }

            return undefined;
        }, {
            timeout: this.timeoutManager().findElementTimeout(),
            message: 'Could not open context menu.',
            id: 'ViewControl.openContextMenu'
        }) as IContextMenu;
    }

    protected async isOpen(sideBarView: ISideBarView = new SideBarView()): Promise<boolean> {
        return await this.isSelected() && await sideBarView.isDisplayed();
    }

    static async getTitles(): Promise<string[]> {
        const titles = [];
        for (const control of await new ActivityBar().getViewControls()) {
            try {
                const title = await control.getTitle();
                titles.push(title);
            }
            catch {
                continue;
            }
        }
        return titles;
    }
}