import {
    DefaultTreeSection,
    IViewContent,
    IViewSection,
    SideBarView,
    TheiaElement,
    WebElement
} from '../../../module';
import { DefaultViewSection } from './DefaultViewSection';
import { repeat, TimeoutError } from '@theia-extension-tester/repeat';

export class ViewContent extends TheiaElement implements IViewContent {
    constructor(sideBar: SideBarView = new SideBarView()) {
        super(ViewContent.locators.components.sideBar.viewContent.constructor, sideBar);
    }

    async hasProgress(): Promise<boolean> {
        const elements = await this.findElements(ViewContent.locators.components.sideBar.viewContent.progress);

        for (const element of elements) {
            if (await element.isDisplayed().catch(() => false)) {
                return true;
            }
        }
        return false;
    }

    async getSection(title: string): Promise<IViewSection> {
        let sections: IViewSection[] = [];

        try {
            return await repeat(async () => {
                sections = await this.getSections();

                for (const section of sections) {
                    if ((await section.getTitle()).startsWith(title)) {
                        return section;
                    }
                }
                return undefined;
            }, {
                timeout: this.timeoutManager().findElementTimeout(),
                message: `Could not find section with title "${title}".`
            }) as IViewSection;
        }
        catch (e) {
            if (e instanceof TimeoutError) {
                const titles = await Promise.all(sections.map((section) => section.getTitle()));
                e.appendMessage(`\nSection titles:\n\t${titles.join('\n\t')}`);
            }
            throw e;
        }
    }

    async getSections(): Promise<IViewSection[]> {
        const view = await this.getActiveView();
        const elements = await view.findElements(ViewContent.locators.components.sideBar.sections.section.constructor);
        const sections: IViewSection[] = [];

        for (const section of elements) {
            if (await section.isDisplayed().catch(() => false) === false) {
                continue;
            }

            if ((await section.findElements(ViewContent.locators.components.sideBar.tree.default.constructor)).length > 0) {
                sections.push(new DefaultTreeSection(section, this));
            }
            else {
                sections.push(new DefaultViewSection(section, this));
            }
        }
        return sections;
    }

    protected async getActiveView(): Promise<TheiaElement> {
        return await repeat(async () => {
            if (await this.isDisplayed().catch(() => false) === false) {
                throw new Error('ViewContent must be displayed.');
            }

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
        }, {
            timeout: this.timeoutManager().findElementTimeout(),
            message: 'Could not find active view.'
        }) as TheiaElement;
    }
}
