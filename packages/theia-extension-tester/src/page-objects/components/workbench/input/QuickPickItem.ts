import {  IQuickPickItem } from "extension-tester-page-objects";
import { TheiaElement } from "../../../theia-components/TheiaElement";

export class QuickPickItem extends TheiaElement implements IQuickPickItem {
    async getLabel(): Promise<string> {
        const label = await this.findElement(QuickPickItem.locators.components.workbench.input.quickPickItem.label);
        return await label.getText();
    }

    async getDescription(): Promise<string> {
        const description = await this.findElement(QuickPickItem.locators.components.workbench.input.quickPickItem.description);
        return await description.getText();
    }

    async select(): Promise<void> {
        await this.safeClick();
    }
}