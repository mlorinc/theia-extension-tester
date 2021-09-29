import { BottomBarPanel, IContextMenu, IMarker, IProblemsView, TheiaElement, WebElement } from "../../../module";

/**
 * Problems view in the bottom panel
 */
export class ProblemsView extends TheiaElement implements IProblemsView {
    constructor(panel: BottomBarPanel) {
        super(panel, panel);
    }

    /**
     * Set the filter using the input box on the problems view
     * @param pattern filter to use, prefferably a glob pattern
     * @returns Promise resolving when the filter pattern is filled in
     */
    async setFilter(pattern: string): Promise<void> {
        throw new Error("Not supported");
    }

    /**
     * Clear all filters
     * @returns Promise resolving to the filter field WebElement 
     */
    async clearFilter(): Promise<WebElement> {
        throw new Error("Not supported");
    }

    /**
     * Collapse all collapsible markers in the problems view
     * @returns Promise resolving when the collapse all button is pressed
     */
    async collapseAll(): Promise<void> {
        const collapseButton = await this.findElement(TheiaElement.locators.components.bottomBar.problemsViewCollapseAll.locator);
        await collapseButton.click();
    }

    /**
     * Get all markers from the problems view with the given type.
     * To get all markers regardless of type, use MarkerType.Any
     * @param type type of markers to retrieve
     * @returns Promise resolving to array of Marker objects
     */
    async getAllMarkers(type: MarkerType): Promise<Marker[]> {
        throw new Error("Not supported");
    }
}

/**
 * Page object for marker in problems view
 */
export class Marker extends TheiaElement implements IMarker {
    constructor(element: WebElement, view: ProblemsView) {
        super(element, view);
    }
    openContextMenu(): Promise<IContextMenu> {
        throw new Error("Method not implemented.");
    }
    /**
     * Get the type of the marker
     * Possible types are: File, Error, Warning
     * @returns Promise resolving to a MarkerType
     */
    async getType(): Promise<MarkerType> {
        throw new Error("Not implemented");
    }

    /**
     * Get the full text of the marker
     * @returns Promise resolving to marker text
     */
    async getText(): Promise<string> {
        throw new Error("Not implemented");
    }

    /**
     * Expand/Collapse the marker if possible
     * @param expand true to expand, false to collapse
     * @returns Promise resolving when the expand/collapse twistie is clicked
     */
    async toggleExpand(expand: boolean): Promise<void> {
        throw new Error("Not implemented");
    }
}

/**
 * Possible types of markers
 *  - File = expandable item representing a file
 *  - Error = an error marker
 *  - Warning = a warning marker
 *  - Any = any of the above
 */
export enum MarkerType {
    File = 'file',
    Error = 'error',
    Warning = 'warning',
    Any = 'any'
}
