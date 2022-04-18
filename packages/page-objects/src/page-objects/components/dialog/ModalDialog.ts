import { IModalDialog, TheiaElement, until, WebElement } from "../../../module";

export class ModalDialog extends TheiaElement implements IModalDialog {
    constructor() {
        super(ModalDialog.locators.components.dialog.constructor);
    }

    async getMessage(): Promise<string> {
        const message = await this.findElement(ModalDialog.locators.components.dialog.content.message);
        return await message.getText();
    }

    async getDetails(): Promise<string> {
        const details = await this.findElement(ModalDialog.locators.components.dialog.content.details);
        return await details.getText();
    }

    async getContent(): Promise<TheiaElement> {
        return await this.findElement(ModalDialog.locators.components.dialog.content.message) as TheiaElement;
    }

    async getButtons(): Promise<WebElement[]> {
        return await this.findElements(ModalDialog.locators.components.dialog.control.button);
    }

    async getError(): Promise<string> {
        const errorElements = await this.findElements(ModalDialog.locators.components.dialog.control.error);
        const errors = await Promise.all(errorElements.map((error) => error.getText()));

        return errors.join('\n');
    }

    async pushButton(title: string): Promise<void> {
        await this.getDriver().wait(async () => {
            const buttons = await this.getButtons() as TheiaElement[];
            for (const button of buttons) {
                if (await button.getText() === title) {
                    await button.safeClick();
                    return true;
                }
            }
            return false;
        }, this.timeoutManager().findElementTimeout(), `Could not find button with title "${title}".`);
    }

    async getMainButton(): Promise<TheiaElement> {
        return await this.getDriver().wait(async () => {
            const buttons = await this.getButtons() as TheiaElement[];
            for (const button of buttons) {
                if (await button.isMain()) {
                    return button;
                }
            }
            return undefined;
        }, this.timeoutManager().findElementTimeout(), `Could not find main button.`) as TheiaElement;
    }

    async getCloseButton(): Promise<TheiaElement> {
        return await this.findElement(ModalDialog.locators.components.dialog.close) as TheiaElement;
    }

    async getSecondaryButton(): Promise<TheiaElement> {
        return await this.getDriver().wait(async () => {
            const buttons = await this.getButtons() as TheiaElement[];
            for (const button of buttons) {
                if (await button.isSecondary()) {
                    return button;
                }
            }
            return undefined;
        }, this.timeoutManager().findElementTimeout(), `Could not find main button.`) as TheiaElement;
    }

    async close(): Promise<void> {
        const closeButton = await this.getCloseButton();
        await closeButton.safeClick();
        await closeButton.getDriver().wait(until.stalenessOf(this), this.timeoutManager().defaultTimeout());
    }

    async confirm(): Promise<void> {
        const button = await this.getMainButton();
        try {
            await button.safeClick();
            await this.getDriver().wait(until.stalenessOf(this), this.timeoutManager().defaultTimeout());
        }
        catch (e) {
            await this.close();
            throw e;
        }
    }

    async cancel(): Promise<void> {
        await this.close();
    }
}
