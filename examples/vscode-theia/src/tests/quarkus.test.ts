import { InputBox, Workbench, IInputBox } from "vscode-extension-tester";
import { expect } from "chai";

describe('quarkus test', function() {
    this.timeout(30000);
    let workbench!: Workbench;

    beforeEach(async function() {
        workbench = new Workbench();
    });

    it('Has explorer', async function() {
        const explorer = await workbench.getActivityBar().getViewControl('Explorer');
        expect(explorer).not.to.be.undefined;
    });

    it('Check first step suggestions', async function() {
        await workbench.executeCommand('Quarkus: Generate a Quarkus project');
        let input: IInputBox | undefined;
        try {
            await workbench.getDriver().wait(() => InputBox.create().catch(() => undefined), this.timeout() - 1000, 'Could not find input box');
            await workbench.getDriver().wait(async () => {
                input = await InputBox.create().catch(() => undefined);

                if (input === undefined) {
                    return false;
                }

                const quickPicks = await input!.getQuickPicks().catch(() => []);
                const titles = await Promise.all(quickPicks.map((x) => x.getLabel()));
                if (titles.includes('Maven') && titles.includes('Gradle')) {
                    return true;
                }
                return false;
            }, this.timeout() - 1000, 'Quick picks were not shown.');
        }
        finally {
            await input?.cancel();
        }
    });

    it('Check quarkus steps', async function() {
        await workbench.executeCommand('Quarkus: Generate a Quarkus project');
        let input: IInputBox | undefined;
        try {
            input = await InputBox.create();
            for (let i = 1; i <= 7; i++) {
                await input.getDriver().wait(async () => (await input!.getTitle().catch(() => ''))?.includes(`${i}`), this.timeout() - 1000, `Step ${i} was not found.`);
                await input.confirm();
            }
        }
        finally {
            await input?.cancel();
        }
    });
});