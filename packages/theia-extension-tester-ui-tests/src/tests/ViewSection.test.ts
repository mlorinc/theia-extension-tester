import { expect } from "chai";
import { ISideBarView, IViewContent, IViewControl, IViewSection, IWorkbench, Workbench } from "@theia-extension-tester/page-objects";

describe('ViewSection', function() {
    this.timeout(40000);
    let workbench: IWorkbench;
    let view: ISideBarView;
    let content: IViewContent;
    let control: IViewControl;
    let section: IViewSection;
    const title = 'Watch';

    before(async function() {
        workbench = new Workbench();
        control = await workbench.getActivityBar().getViewControl('Debug');
        view = await control.openView();
        content = view.getContent();
        section = await content.getSection(title);
    });

    beforeEach(async function() {
        await section.expand();
    });

    after(async function() {
        await control.closeView();
    });

    it('getTitle', async function() {
        expect(await section.getTitle()).equals(title);
    });

    it('expand', async function() {
        await section.collapse();
        expect(await section.isExpanded()).to.be.false;
        await section.expand();
        expect(await section.isExpanded()).to.be.true;
        await section.collapse();
        expect(await section.isExpanded()).to.be.false;
    });

    it('collapse', async function() {
        await section.expand();
        expect(await section.isExpanded()).to.be.true;
        await section.collapse();
        expect(await section.isExpanded()).to.be.false;
    });

    it('isExpanded', async function() {
        await section.expand();
        expect(await section.isExpanded()).to.be.true;
        await section.collapse();
        expect(await section.isExpanded()).to.be.false;
    });

    it('getActions', async function() {
        await section.expand();
        await section.getAction('Collapse All');
        const actions = await section.getActions();
        const titles = await Promise.all(actions.map(action => action.getLabel()));
        expect(titles).include.members(['Add Expression', 'Collapse All', 'Remove All Expressions'])
    });

    it('getAction', async function() {
        await section.expand();
        const action = await section.getAction('Collapse All');
        expect(await action.getLabel()).equals('Collapse All');
    });
});
