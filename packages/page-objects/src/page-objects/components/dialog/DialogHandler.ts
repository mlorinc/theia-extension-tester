import { FileType, OpenDialog } from "../../../module";

/**
 * Handles native dialogs for different platforms
 */
 export class DialogHandler {

    /**
     * Get the appropriate native dialog for opening folders.
     * Returns platform specific dialog object.
     * 
     * @param delay time to wait for the dialog to open in milliseconds
     */
    static async getOpenDialog(type: FileType): Promise<OpenDialog> {
        return new OpenDialog(type);
    }
}
