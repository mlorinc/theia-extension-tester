import {
    IViewPanelAction,
    TheiaElement,
    ViewSection,
    WebElement
} from '../../../module';

export class ViewPanelAction extends TheiaElement implements IViewPanelAction {
    constructor(element: WebElement, section: ViewSection) {
        super(element, section);
    }

    async getLabel(): Promise<string> {
        const fn = ViewPanelAction.locators.components.sideBar.sections.section.header.toolbar.action.properties?.title;

        if (fn) {
            return await fn(this, ViewPanelAction.locators);
        }
        else {
            throw new Error('ViewPanelAction.locators.components.sideBar.sections.section.header.toolbar.action.properties.title is undefined.');
        }
    }
}
