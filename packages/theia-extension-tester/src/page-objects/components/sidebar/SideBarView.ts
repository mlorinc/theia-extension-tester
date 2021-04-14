import {
    ISideBarView,
    IViewContent,
    IViewTitlePart,
    TheiaElement,
    ViewContent,
    ViewTitlePart
} from '../../../module';

export class SideBarView extends TheiaElement implements ISideBarView {

    constructor() {
        super(SideBarView.locators.components.sideBar.constructor);
    }

    getTitlePart(): IViewTitlePart {
        return new ViewTitlePart(this);
    }
    getContent(): IViewContent {
        return new ViewContent(this);
    }

    static async isOpen(): Promise<boolean> {
        return new SideBarView().isDisplayed();
    }
}
