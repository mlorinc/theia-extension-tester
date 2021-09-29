import { expect } from "chai";
import { Workbench } from "@theia-extension-tester/page-objects";

describe('Workbench', function () {
    this.timeout(40000);
    let workbench: Workbench;
    const expectedWorkbenchPath = process.env['THEIA_EXPECTED_WORKBENCH_PATH'] ?? '/projects'; 

    beforeEach(function () {
        workbench = new Workbench();
        //@ts-ignore
        Workbench.openFolder = undefined;
    });

    it('getTitleBar', async function () {
        const item = await workbench.getTitleBar().getItem('File');
        expect(item).not.to.be.undefined;
    });

    it('getActivityBar', async function () {
        const item = await workbench.getActivityBar().getViewControl('Explorer');
        expect(item).not.to.be.undefined;
        await item!.openView();
    });

    it('getSideBar', async function () {
        const item = workbench.getSideBar().getTitlePart();
        expect(await item.getTitle()).includes('Explorer');
    });

    it('getStatusBar', async function () {
        const status = workbench.getStatusBar();
        await status.isDisplayed();
    });

    it.skip('getBottomBar', async function () { });

    it('getEditorView', async function () {
        const item = workbench.getEditorView();
        await item.getOpenEditorTitles();
    });

    it.skip('getNotifications', async function () { });

    it('openNotificationsCenter', async function () {
        const center = await workbench.openNotificationsCenter();
        try {
            expect(await center.isDisplayed());
        }
        finally {
            await center.close();
        }
    });

    it.skip('openSettings', async function () { });

    it('openCommandPrompt', async function () {
        const item = await workbench.openCommandPrompt();
        try {
            expect(item).not.to.be.undefined;
            expect(await item.getText()).equals('>');
        }
        finally {
            await item.cancel();
        }
    });

    it('executeCommand', async function () {
        await workbench.executeCommand('Cut');
        await workbench.executeCommand('>Cut');
    });

    it('openFolderPath', async function () {
        expect(await workbench.getOpenFolderPath()).equals(expectedWorkbenchPath);
    });

    it('openFolderPath - another view opened', async function () {
        const debug = await workbench.getActivityBar().getViewControl('Debug');
        expect(debug).not.to.be.undefined;
        const title = await debug!.getTitle();
        await debug!.openView();
        const workspace = await workbench.getOpenFolderPath();
        expect(workspace).equals(expectedWorkbenchPath);
        expect(await workbench.getSideBar().getTitlePart().getTitle()).equals(title);
        await debug!.closeView();
    });
});
