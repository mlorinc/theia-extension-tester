import { ISideBarView, IViewTitlePart, IViewContent, SeleniumBrowser } from "extension-tester-page-objects";
import { By, WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../theia-components/TheiaElement";

export class SideBarView extends TheiaElement implements ISideBarView {

    constructor(sidebar?: WebElement) {
        super(sidebar || SeleniumBrowser.instance.driver.findElement(By.css("body")));
    }

    getTitlePart(): IViewTitlePart {
        throw new Error("Method not implemented.");
    }
    getContent(): IViewContent {
        throw new Error("Method not implemented.");
    }
}
