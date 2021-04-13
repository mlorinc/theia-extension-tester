import { TheiaElement } from "../../theia-components/TheiaElement";
import { ModalDialog } from "./ModalDialog";

export class ModalDialogButton extends TheiaElement {
    constructor(buttonElement: TheiaElement, parent: ModalDialog) {
        super(buttonElement, parent);
    }

    async isEnabled(): Promise<boolean> {
        return await super.isEnabled() && await this.getProperty('enabled') as boolean;
    }
}
