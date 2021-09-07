import {
    ITitleBar,
    IWindowControls,
    SeleniumBrowser,
    TheiaElement,
    TitleBar
} from '../../../module';

export class WindowControls extends TheiaElement implements IWindowControls {
    constructor(bar?: ITitleBar) {
        super(bar || new TitleBar());
    }

    async minimize(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async maximize(): Promise<void> {
        await this.getDriver().manage().window().maximize();
    }
    restore(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async close(): Promise<void> {
        await SeleniumBrowser.instance.quit();
    }
}
