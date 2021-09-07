import { expect } from "chai";
import { ISideBarView, IViewControl, IViewTitlePart, IWorkbench, Workbench } from "@theia-extension-tester/page-objects";

describe('ViewTitlePart', function() {
    this.timeout(40000);
    let workbench: IWorkbench;
    let view: ISideBarView;
    let control: IViewControl;
    let titlePart: IViewTitlePart;
    const title = 'Search';

    before(async function() {
        workbench = new Workbench();
        control = await workbench.getActivityBar().getViewControl(title);
        view = await control.openView();
        titlePart = view.getTitlePart();
    });

    after(async function() {
        await control.closeView();
    });

    it('getTitle', async function() {
        expect(await titlePart.getTitle()).equals(title);
    });

    it('getActions', async function() { 
        await titlePart.getAction('Clear Search Results');
        const actions = await titlePart.getActions();
        const titles = await Promise.all(actions.map((action) => action.getTitle()));
        expect(titles).to.have.members(['Refresh', 'Clear Search Results', 'Collapse All']);
    });

    it('getAction', async function() { 
        const action = await titlePart.getAction('Clear Search Results');
        expect(action).not.to.be.undefined;
    });

    it('ITitleActionButton.getTitle', async function() { 
        const action = await titlePart.getAction('Clear Search Results');
        expect(action).not.to.be.undefined;
        expect(await action.getTitle()).equals('Clear Search Results');
    });
});
