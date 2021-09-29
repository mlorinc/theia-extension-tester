import { expect } from "chai";
import { ISideBarView, IViewContent, IViewControl, IWorkbench, Workbench } from "@theia-extension-tester/page-objects";

describe('ViewContent', function () {
    this.timeout(40000);
    let workbench: IWorkbench;
    let view: ISideBarView;
    let control: IViewControl;
    let content: IViewContent;

    const title = 'Search';

    before(async function () {
        workbench = new Workbench();
        control = await workbench.getActivityBar().getViewControl(title) as IViewControl;
        view = await control.openView();
        content = view.getContent();
    });

    after(async function () {
        await control.closeView();
    });

    it.skip('hasProgress', async function () {
    });

    it('getSection', async function () {
        control = await workbench.getActivityBar().getViewControl('Debug') as IViewControl;
        view = await control.openView();
        content = view.getContent();

        const section = await content.getSection('Variables');
        expect(section).not.to.be.undefined;
        expect(await section.getTitle(), 'Variables')
    });

    it('getSections', async function () {
        await content.getSection('Variables');
        const sections = await content.getSections();
        const titles = await Promise.all(sections.map((section) => section.getTitle()));
        expect(titles).to.include.members(['Threads', 'Call Stack', 'Variables', 'Watch', 'Breakpoints']);
    });
});
