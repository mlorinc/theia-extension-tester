import { expect } from "chai";
import { ActivityBar, ContextMenu, IViewControl, SeleniumBrowser, SideBarView } from "@theia-extension-tester/page-objects";
import { CheTheiaBrowser } from "@theia-extension-tester/che-browser";

describe('ActivityBar', function () {
    this.timeout(40000);
    let bar: ActivityBar;
    let viewControl: IViewControl | undefined;
    let menu: ContextMenu | undefined;

    beforeEach(async function () {
        bar = new ActivityBar();
        await viewControl?.closeView();
        await menu?.close();
        viewControl = undefined;
        menu = undefined;
    });

    after(async function() {
        await viewControl?.closeView();
        await menu?.close();
    });

    it('getViewControl', async function () {
        viewControl = await bar.getViewControl('Explorer');
        expect(await viewControl.getTitle()).includes('Explorer');
        const view = await viewControl.openView();
        expect(await view.isDisplayed()).to.be.true;
        const titlePart = view.getTitlePart();
        expect(await titlePart.isDisplayed()).to.be.true;
        console.log(await titlePart.getAttribute('innerHTML'));
        expect(await titlePart.getTitle()).includes('Explorer');
    });

    it('getViewControls', async function () {
        const controls = await bar.getViewControls();
        const titles = await Promise.all(controls.map((control => control.getTitle())));
        expect(titles).to.include.members(['Search', 'Debug']);
    });

    it('getGlobalAction', async function () {
        if (SeleniumBrowser.instance instanceof CheTheiaBrowser) {
            const action = await bar.getGlobalAction('Accounts');
            menu = await action.openContextMenu() as ContextMenu;
            // includes 'You are not signed in to any accounts'
            expect(await menu.getItems()).length(1);
        }
        else {
            const action = await bar.getGlobalAction('Settings');
            expect(await action.getTitle()).equals('Settings');
        }
    });

    it('getGlobalActions', async function () {
        const actions = await bar.getGlobalActions();
        const titles = await Promise.all(actions.map((action => action.getTitle())));

        let expectedTitles = [];

        if (SeleniumBrowser.instance instanceof CheTheiaBrowser) {
            expectedTitles = ['Accounts', 'Settings'];
        }
        else {
            expectedTitles = ['Settings'];
        }

        expect(titles).to.include.members(expectedTitles);
    });

    it('openContextMenu', async function () {
        expect(() => bar.openContextMenu()).throws();
    });


    describe('ViewControl', function () {
        this.timeout(40000);
        
        it('openView', async function() {
            viewControl = await bar.getViewControl('Debug');
            const view = await viewControl.openView();
            expect(await view.getTitlePart().getTitle()).equals('Debug');
        });

        it('closeView', async function() {
            viewControl = await bar.getViewControl('Debug');
            await viewControl.openView();
            expect(await SideBarView.isOpen()).equals(true);
            await viewControl.closeView();
            expect(await SideBarView.isOpen()).equals(false);
        });

        it('getTitle', async function() {
            viewControl = await bar.getViewControl('Explorer');
            expect(await viewControl.getTitle()).includes('Explorer');
        });

        it('openContextMenu', async function() {
            viewControl = await bar.getViewControl('Explorer');
            menu = await viewControl.openContextMenu() as ContextMenu;
            const items = await Promise.all((await menu.getItems()).map((item) => item.getLabel()));
            expect(items).include.members(['Close', 'Close Others', 'Close All', 'Collapse']);
        });
    });
});

