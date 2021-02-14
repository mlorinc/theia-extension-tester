import { ITextView } from "extension-tester-page-objects";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { Menu } from "../menu/Menu";

/**
 * View with channel selection and text area
 */
export class TextView extends TheiaElement implements ITextView {
    getChannelNames(): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
    getCurrentChannel(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    selectChannel(name: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    openContextMenu(): Promise<Menu> {
        throw new Error("Method not implemented.");
    }
    /**
     * Get all text from the currently open channel
     * @returns Promise resolving to the view's text
     */
    async getText(): Promise<string> {
        return 'hello';
    }

    /**
     * Clear the text in the current channel
     * @returns Promise resolving when the clear text button is pressed
     */
    async clearText(): Promise<void> {

    }
}
