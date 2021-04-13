import { ITitleActionButton } from 'extension-tester-page-objects';
import { WebElement } from 'selenium-webdriver';
import { TheiaElement } from '../../theia-components/TheiaElement';
import { ViewTitlePart } from './ViewTitlePart';

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
