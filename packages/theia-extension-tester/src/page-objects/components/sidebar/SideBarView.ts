import { ISideBarView, IViewTitlePart, IViewContent } from "extension-tester-page-objects";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { ViewContent } from "./ViewContent";
import { ViewTitlePart } from "./ViewTitlePart";

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
