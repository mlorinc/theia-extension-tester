import { expect } from "chai";
import { IInputBox, Input, TitleBar, until, Workbench } from "@theia-extension-tester/page-objects";

describe('Input', function() {
    this.timeout(40000);
    let input: IInputBox;

    beforeEach(async function() {
        await new TitleBar().select('View', 'Find Command...');
        input = await Input.create();
    });

    it('Input.create', async function() {
        await input.cancel();
        await new TitleBar().select('View', 'Find Command...');
        input = await Input.create();
        expect(await input.isDisplayed()).to.be.true;
    });

    afterEach(async function () {
        await input.cancel();
    });

    it('Input.cancel', async function() {
        this.timeout(80000);
        await input.setText('>Paste');
        await input.cancel();
        expect(await input.isDisplayed()).to.be.false;
    });

    it('Complex setText', async function() {
        const values = ['Hello', 'World', 'azazaza', 'experiment', 'lorem ipsum lorem'];
        await input.clear();

        let previousValue = '';
        for (const value of values) {
            expect(await input.getText()).equals(previousValue);
            await input.setText(value);
            previousValue = value;
            expect(await input.getText()).equals(value);
        }
    });

    it('Input.findQuickPick', async function() {
        const pick = await input.findQuickPick('Paste');
        expect(pick).not.to.be.undefined;
        expect(await pick!.getLabel()).to.equal('Paste')
    });

    it('Input.findQuickPick - index', async function() {
        let pick = await input.findQuickPick(100);
        expect(pick).not.to.be.undefined;
        expect(await pick!.getIndex()).to.equal(100);
        
        pick = await input.findQuickPick(30);
        expect(pick).not.to.be.undefined;
        expect(await pick!.getIndex()).to.equal(30)
    });

    it('Input.selectQuickPick', async function() {
        await input.selectQuickPick('Cut');
    });

    it('Input.getPlaceHolder', async function() {
        await input.clear();
        expect(await input.getPlaceHolder()).equals("File name to search (append : to go to line). (Press Ctrl+P to show/hide ignored files)");
    });

    it('Input.hasProgress', async function() {
        await input.getDriver().wait(async () => await input.hasProgress() === false, this.timeout() - 2000);
    });

    it('Input.getQuickPicks', async function() {
        expect(await input.getQuickPicks()).not.empty;
    });

    it('Input.setText', async function() {
        await input.setText('Hello world');
    });

    it('Input.getText', async function() {
        await input.setText('Hello world');
        expect(await input.getText()).to.equal('Hello world');
    });

    it('Input.clear', async function() {
        await input.setText('Hello world');
        await input.clear();
        expect(await input.getText()).to.be.empty;
    });

    it('Input.confirm', async function() {
        await input.setText('>Paste');
        await input.confirm();
        await input.getDriver().wait(until.elementIsNotVisible(input), this.timeout() - 2000);
    });

    it.skip('Input.getTitle', async function() {
        // Java extension is taking way too long to activate.
        this.timeout(120000);
        await new Workbench().executeCommand('Quarkus: Generate a Quarkus project');
        await input.getDriver().wait(async () => await input.getPlaceHolder() === 'Pick build tool', this.timeout() - 2000);
        expect(await input.getTitle()).equals('Quarkus Tools (1/8)');
    });

    // for some reason theia 1.16.0 does not back button
    it.skip('Input.back', async function() {
        this.timeout(80000);
        await new Workbench().executeCommand('Quarkus: Generate a Quarkus project');
        await input.getDriver().wait(async () => await input.getPlaceHolder() === 'Pick build tool', this.timeout() - 2000);
        await input.confirm();
        await input.getDriver().wait(async () => await input.getTitle() === 'Quarkus Tools (2/8)', this.timeout() - 2000);
        await input.back();
        await input.getDriver().wait(async () => await input.getTitle() === 'Quarkus Tools (1/8)', this.timeout() - 2000);
    });

    // for some reason theia 1.16.0 does not have error
    it.skip('Input.hasError', async function() {
        this.timeout(80000);
        await new Workbench().executeCommand('Quarkus: Generate a Quarkus project');
        await input.getDriver().wait(async () => await input.getPlaceHolder() === 'Pick build tool', this.timeout() - 2000);
        await input.setText('Maven');
        await input.confirm();
        await input.getDriver().wait(async () => await input.getTitle() === 'Quarkus Tools (2/8)', this.timeout() - 2000);

        expect(await input.hasError()).to.be.false;

        await input.setText('/');
        await input.getDriver().wait(async () => await input.hasError(), this.timeout() - 2000);
    });

    it.skip('Input.getMessage', async function() {
        this.timeout(80000);
        await new Workbench().executeCommand('Quarkus: Generate a Quarkus project');
        await input.getDriver().wait(async () => await input.getPlaceHolder() === 'Pick build tool', this.timeout() - 2000);
        await input.setText('Maven');
        await input.confirm();
        try {
            await input.getDriver().wait(async () => await input.getMessage() === "Your project groupId (Press 'Enter' to confirm or 'Escape' to cancel)", this.timeout() - 10000);
        }
        catch {
            expect(await input.getMessage()).equals("Your project groupId (Press 'Enter' to confirm or 'Escape' to cancel)");
        }
    });

    it.skip('Input.isPassword', async function() {
        this.timeout(80000);
    });
});
