import { repeat } from 'extension-tester-page-objects';
import {
    CustomTreeSection,
    DefaultTreeSection,
    getTimeout,
    IViewContent,
    IViewSection,
    SideBarView,
    TheiaElement,
    WebElement
} from '../../../module';

export class ViewContent extends TheiaElement implements IViewContent {
    constructor(sideBar: SideBarView = new SideBarView()) {
        super(ViewContent.locators.components.sideBar.viewContent.constructor, sideBar);
    }

    async hasProgress(): Promise<boolean> {
        const elements = await this.findElements(ViewContent.locators.components.sideBar.viewContent.progress);

        for (const element of elements) {
            if (await element.isDisplayed()) {
                return true;
            }
        }
        return false;
    }

    async getSection(title: string): Promise<IViewSection> {
        return await repeat(async () => {
            const sections = await this.getSections();

            for (const section of sections) {
                if ((await section.getTitle()).startsWith(title)) {
                    return section;
                }
            }
            return undefined;
        }, {
            timeout: getTimeout(),
            message: `Could not find section with title "${title}".`
        }) as IViewSection;
    }

    async getSections(): Promise<IViewSection[]> {
        const view = await this.getActiveView();
        const elements = await view.findElements(ViewContent.locators.components.sideBar.sections.section.constructor);
        const sections: IViewSection[] = [];

        for (const section of elements) {
            if (await section.isDisplayed() === false) {
                continue;
            }

            if ((await section.findElements(ViewContent.locators.components.sideBar.tree.default.constructor)).length > 0) {
                sections.push(new DefaultTreeSection(section, this));
            }
            else {
                sections.push(new CustomTreeSection(section, this));
            }
        }
        return sections;
    }

    protected async getActiveView(): Promise<TheiaElement> {
        return await this.getDriver().wait(async () => {
            const views = await this.findElements(ViewContent.locators.components.sideBar.sections.constructor);
            let outputView: WebElement | undefined = undefined;
            for (const view of views) {
                if (await view.isDisplayed()) {
                    if (outputView) {
                        throw new Error('Found another visible view. This is unexpected.');
                    }
                    outputView = view;
                }
            }

            return outputView;
        }, getTimeout(), 'Could not find active view.') as TheiaElement;
    }
}
