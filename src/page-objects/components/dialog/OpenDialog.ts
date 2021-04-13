import { IOpenDialog } from "extension-tester-page-objects";
import { FileTreeWidget } from "../../theia-components/widgets/tree/FileTreeWidget";
import { ModalDialog } from "./ModalDialog";
import * as pathLib from "path";
import { ScrollDirection } from "../../theia-components/widgets/scrollable/ScrollableWidget";
import { ModalDialogButton } from "./ModalDialogButton";
import { PathUtils } from "extension-tester-page-objects";
import { TheiaElement } from "../../theia-components/TheiaElement";

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
        const tree = new FileTreeWidget(undefined, content);
        const segments = PathUtils.convertToTreePath(path);
        console.log(`Opening: ${segments.join(', ')}`);
        
        const items = await tree.getVisibleItems();

        for (const item of items) {
            console.log(`Item: "${await item.getLabel()}".`);
        }

        const node = await tree.findNodeByPath({
            direction: ScrollDirection.NEXT,
            strict: true,
            path: segments
        });
        await node.safeClick();
    }
}
