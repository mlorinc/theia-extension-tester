import * as pathLib from 'path';
import {
    DialogTree,
    FileType,
    IOpenDialog,
    ModalDialog,
    ModalDialogButton,
    TheiaElement
} from '../../../module';

import { PathUtils } from "@theia-extension-tester/path-utils";

export class OpenDialog extends ModalDialog implements IOpenDialog {
    constructor(private type: FileType) {
        super();
    }

    async selectPath(path: string): Promise<void> {
        if (!pathLib.isAbsolute(path)) {
            throw new Error(`Path "${path}" must be absolute.`);
        }

        const content = await this.getContent();
        const navigationUp = await content.findElements(OpenDialog.locators.components.dialog.navigationUp);
        if (navigationUp.length > 0) {
            const upButton = new ModalDialogButton(
                navigationUp[0] as TheiaElement, this
            );

            while (await upButton.isEnabled()) {
                await upButton.click();
            }
        }
        const tree = new DialogTree(content);
        const node = await tree.findFile(PathUtils.convertToTreePath(path), this.type, this.timeoutManager().findElementTimeout());
        await node.safeClick();
    }
}
