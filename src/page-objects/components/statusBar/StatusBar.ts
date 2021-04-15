import { getTimeout } from 'extension-tester-page-objects';
import { until } from 'selenium-webdriver';
import { INotificationsCenter, IStatusBar, TheiaElement } from '../../../module';
import { NotificationCenter } from '../workbench/NotificationCenter';

export class StatusBar extends TheiaElement implements IStatusBar {
    constructor() {
        super(StatusBar.locators.components.statusBar.constructor);
    }

    async openNotificationsCenter(): Promise<INotificationsCenter> {
        let center = new NotificationCenter();

        if (await NotificationCenter.isOpen() === false) {
            const button = await this.findElement(StatusBar.locators.components.statusBar.openNotificationCenter) as TheiaElement;
            await button.safeClick();
            await this.getDriver().wait(until.elementIsVisible(center), getTimeout());
        }

        return center;
    }

    async closeNotificationsCenter(): Promise<void> {
        if (await NotificationCenter.isOpen() === false) {
            return;        
        }
        const center = new NotificationCenter();
        const button = await this.findElement(StatusBar.locators.components.statusBar.openNotificationCenter) as TheiaElement;
        await button.safeClick();
        await this.getDriver().wait(until.elementIsNotVisible(center), getTimeout());
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
