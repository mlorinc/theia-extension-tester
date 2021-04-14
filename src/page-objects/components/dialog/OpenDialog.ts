import { DialogTree, getTimeout, IOpenDialog, ModalDialog, ModalDialogButton, TheiaElement } from "../../../module";
import * as pathLib from "path";

export class OpenDialog extends ModalDialog implements IOpenDialog {
    async selectPath(path: string): Promise<void> {
        if (!pathLib.isAbsolute(path)) {
            throw new Error(`Path "${path}" must be absolute.`);
        }


        const content = await this.getContent();
        const upButton = new ModalDialogButton(
            await content.findElement(OpenDialog.locators.components.dialog.navigationUp) as TheiaElement, this
        );

        while (await upButton.isEnabled()) {
            await upButton.click();
        }

        console.log(`Looking for tree`);
        const tree = new DialogTree(content);
        console.log(`Opening: ${path}`);

        const items = await tree.getVisibleItems();

        for (const item of items) {
            console.log(`Item: "${await item.getLabel()}".`);
        }

        await tree.resetScroll();
        const node = await tree.findFile(path, getTimeout());
        await node.safeClick();
    }
}
