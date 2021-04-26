import * as pathLib from 'path';
import {
    DialogTree,
    FileType,
    getTimeout,
    IOpenDialog,
    ModalDialog,
    ModalDialogButton,
    PathUtils,
    TheiaElement
} from '../../../module';

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

        console.log(`Looking for tree`);
        const tree = new DialogTree(content);
        console.log(`Opening: ${path}`);

        const items = await tree.getVisibleItems();

        for (const item of items) {
            console.log(`Item: "${await item.getLabel()}".`);
        }

        const node = await tree.findFile(PathUtils.convertToTreePath(path), this.type, getTimeout());
        await node.safeClick();
    }
}
