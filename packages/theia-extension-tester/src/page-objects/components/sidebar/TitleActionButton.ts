import {
    ITitleActionButton,
    TheiaElement,
    ViewTitlePart,
    WebElement
} from '../../../module';

export class TitleActionButton extends TheiaElement implements ITitleActionButton {
    constructor(element: WebElement, parent: ViewTitlePart) {
        super(element, parent);
    }

    async getTitle(): Promise<string> {
        const fn = ViewTitlePart.locators.components.sideBar.viewTitlePart.action.constructor.properties?.title;

        if (fn) {
            return await fn(this, TitleActionButton.locators);
        }
        else {
            throw new Error('ViewTitlePart.locators.components.sideBar.viewTitlePart.action.constructor.properties?.title is undefined.')
        }
    }
}
