import { INotificationsCenter, IStatusBar } from "extension-tester-page-objects";
import { TheiaElement } from "../../theia-components/TheiaElement";

export class StatusBar extends TheiaElement implements IStatusBar {
    constructor() {
        super(StatusBar.locators.components.statusBar.constructor);
    }

    openNotificationsCenter(): Promise<INotificationsCenter> {
        throw new Error("Method not implemented.");
    }
    closeNotificationsCenter(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    openLanguageSelection(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getCurrentLanguage(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    openLineEndingSelection(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getCurrentLineEnding(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    openEncodingSelection(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getCurrentEncoding(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    openIndentationSelection(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getCurrentIndentation(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    openLineSelection(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getCurrentPosition(): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
