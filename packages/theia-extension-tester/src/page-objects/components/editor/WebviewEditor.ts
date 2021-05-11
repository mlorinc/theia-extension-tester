import { Editor, IWebView, Locator, WebElement } from "../../../module";

export class WebView extends Editor implements IWebView {
    findWebElement(locator: Locator): Promise<WebElement> {
        throw new Error("Method not implemented.");
    }
    findWebElements(locator: Locator): Promise<WebElement[]> {
        throw new Error("Method not implemented.");
    }
    switchToFrame(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    switchBack(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
