import { expect } from "chai";
import { ISideBarView, IViewControl, IWorkbench, Workbench } from "@theia-extension-tester/page-objects";

describe('SideBarView', function() {
    this.timeout(40000);
    let workbench: IWorkbench;
    let view: ISideBarView;
    let control: IViewControl;
    const title = 'Explorer';

    before(async function() {
        workbench = new Workbench();
        control = await workbench.getActivityBar().getViewControl(title) as IViewControl;
        view = await control.openView();
    });

    after(async function() {
        await control.closeView();
    });

    it('getTitlePart', async function() {
        const titlePart = view.getTitlePart();
        expect(titlePart).not.to.be.undefined;
        expect((await titlePart.getTitle()).startsWith(title), `Expected title to start with "${title}"`).to.be.ok;
        expect(await titlePart.isDisplayed()).to.be.true;
    });

    it('getContent', async function() { 
        const content = view.getContent();
        expect(content).not.to.be.undefined;
        expect(await content.isDisplayed()).to.be.true;
    });
});
