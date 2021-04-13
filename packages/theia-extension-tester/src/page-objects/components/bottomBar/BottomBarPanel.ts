import { getTimeout, IBottomBarPanel } from "extension-tester-page-objects";
import { until } from "selenium-webdriver";
import { TheiaElement } from "../../theia-components/TheiaElement";
import { TitleBar } from "../menu/TitleBar";
import { Input } from "../workbench/input/Input";
import { DebugConsoleView } from './DebugConsoleView';
import { OutputView } from './OutputView';
import { ProblemsView } from './ProblemsView';
import { TerminalView } from "./TerminalView";

/**
 * Page object for the bottom view panel
 */
export class BottomBarPanel extends TheiaElement implements IBottomBarPanel {

    constructor() {
        super(TheiaElement.locators.components.bottomBar.bottomBarPanel);
    }

    async toggle(open: boolean): Promise<void> {
        const displayed = await this.isDisplayed();

        // the same state, no change needed
        if (displayed === open) {
            return;
        }

        const titleBar = new TitleBar();
        await titleBar.select('View', 'Toggle Bottom Panel');

        if (open) {
            await this.getDriver().wait(until.elementIsVisible(this), getTimeout());
        }
        else {
            await this.getDriver().wait(until.elementIsNotVisible(this), getTimeout());
        }
    }
    
    /**
     * Open the Problems view in the bottom panel
     * @returns Promise resolving to a ProblemsView object
     */
    async openProblemsView(): Promise<ProblemsView> {
        const titleBar = new TitleBar();
        await titleBar.select('View', 'Problems');
        return new ProblemsView(this);
    }

    /**
     * Open the Output view in the bottom panel
     * @returns Promise resolving to OutputView object
     */
    async openOutputView(): Promise<OutputView> {
        const titleBar = new TitleBar();
        await titleBar.select('View', 'Output');
        // return new OutputView();
        throw new Error('Not supported');
    }

    /**
     * Open the Debug Console view in the bottom panel
     * @returns Promise resolving to DebugConsoleView object
     */
    async openDebugConsoleView(): Promise<DebugConsoleView> {
        const titleBar = new TitleBar();
        await titleBar.select('View', 'Debug Console');
        // return new DebugConsoleView();
        throw new Error('Not supported');
    }

    /**
     * Open the Terminal view in the bottom panel
     * @returns Promise resolving to TerminalView object
     */
    async openTerminalView(): Promise<TerminalView> {
        const titleBar = new TitleBar();
        await titleBar.select('Terminal', 'Open Terminal in specific container');
        const input = new Input();
        // await input.setText(terminalName || '');
        await input.confirm();
        // return new TerminalView(terminalName);
        throw new Error('Not supported');
    }

    /**
     * Maximize the the bottom panel if not maximized
     * @returns Promise resolving when the maximize button is pressed
     */
    async maximize(): Promise<void> {
        throw new Error('Not supported');
    }

    /**
     * Restore the the bottom panel if maximized
     * @returns Promise resolving when the restore button is pressed
     */
    async restore(): Promise<void> {
        throw new Error('Not supported');
    }
}
