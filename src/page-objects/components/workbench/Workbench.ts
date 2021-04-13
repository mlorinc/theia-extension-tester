import * as path from 'path';
import { ActivityBar } from '../activityBar/ActivityBar';
import { By, WebDriver } from 'selenium-webdriver';
import { DialogHandler } from '../dialog/DialogHandler';
import { EditorView } from '../editor/EditorView';
import {
    getTimeout,
    IActivityBar,
    IBottomBarPanel,
    IEditorView,
    IInput,
    INotification,
    INotificationsCenter,
    IOpenDialog,
    ISettingsEditor,
    ISideBarView,
    IStatusBar,
    ITitleBar,
    IWorkbench,
    SeleniumBrowser,
    PathUtils,
    IViewControl

} from 'extension-tester-page-objects';
import { Input } from './input/Input';
import { SideBarView } from '../sidebar/SideBarView';
import { TheiaElement } from '../../theia-components/TheiaElement';
import { TitleBar } from '../menu/TitleBar';
import { DefaultTreeSection } from '../sidebar/tree/default/DefaultTreeSection';
import { StatusBar } from '../statusBar/StatusBar';

export class Workbench extends TheiaElement implements IWorkbench {
    private static openFolder: string | undefined;


    constructor() {
        super(By.css('body'));
    }

    private async isWorkspaceOpen(): Promise<boolean> {
        const title = await this.getExplorerTitle();
        return title.endsWith('(Workspace)');
    }

    private async getExplorerTitle(): Promise<string> {
        if (Workbench.openFolder) {
            return Workbench.openFolder;
        }

        const explorer = await this.getActivityBar().getViewControl('Explorer');
        const controls = await this.getActivityBar().getViewControls();
        let originalControl: IViewControl | undefined = undefined;

        for (const control of controls) {
            if (await control.isSelected()) {
                originalControl = control;
            }
        }

        const sideBar = await explorer.openView();

        const title = await this.getDriver().wait(async () => {
            for (const section of await sideBar.getContent().getSections()) {
                if (section instanceof DefaultTreeSection) {
                    return await section.getTitle().catch(() => undefined);
                }
            }
            return undefined;
        }, getTimeout(), 'Could not find file section.') as string;

        await originalControl?.openView();
        Workbench.openFolder = title;
        return title;
    }

    async getOpenFolderPath(): Promise<string> {
        const title = await this.getExplorerTitle();
        return PathUtils.normalizePath(title);
    }

    async getOpenFolderName(): Promise<string> {
        return path.basename(await this.getOpenFolderPath());
    }

    getTitleBar(): ITitleBar {
        return new TitleBar();
    }
    getSideBar(): ISideBarView {
        return new SideBarView();
    }
    getActivityBar(): IActivityBar {
        return new ActivityBar();
    }
    getStatusBar(): IStatusBar {
        return new StatusBar();
    }
    getBottomBar(): IBottomBarPanel {
        throw new Error("Method not implemented.");
    }
    getEditorView(): IEditorView {
        return new EditorView();
    }
    getNotifications(): Promise<INotification[]> {
        throw new Error("Method not implemented.");
    }
    openNotificationsCenter(): Promise<INotificationsCenter> {
        throw new Error("Method not implemented.");
    }
    openSettings(): Promise<ISettingsEditor> {
        throw new Error("Method not implemented.");
    }

    async openCommandPrompt(): Promise<IInput> {
        if (await Input.isOpen() === false) {
            await new TitleBar().select('View', 'Find Command...');
        }
        return new Input();
    }

    async executeCommand(command: string): Promise<void> {
        if (!command.startsWith('>')) {
            command = `>${command}`;
        }

        const input = await this.openCommandPrompt();
        await input.setText(command);
        await input.selectQuickPick(command.slice(1));
    }

    async openFolder(folderPath: string): Promise<void> {
        await new TitleBar().select('File', 'Open...');
        folderPath = PathUtils.normalizePath(folderPath);

        if (!path.isAbsolute(folderPath)) {
            folderPath = path.join(await this.getOpenFolderPath(), folderPath);
        }

        if (await this.isWorkspaceOpen() === false && await this.getOpenFolderPath() === folderPath) {
            return;
        }

        const browser = SeleniumBrowser.instance;
        const oldHandleCount = (await browser.driver.getAllWindowHandles()).length;

        const dialog = await this.getOpenDialog();
        await dialog.selectPath(folderPath);
        await dialog.confirm();

        const handles = await browser.driver.wait(async (driver: WebDriver) => {
            const handles = await driver.getAllWindowHandles();

            if (handles.length > oldHandleCount) {
                return handles;
            }

            return undefined;
        }, getTimeout(), `Need more than ${oldHandleCount} window handles to open folder.`) as string[];

        if (oldHandleCount > 1) {
            await browser.driver.close();
        }

        await browser.driver.switchTo().window(handles[handles.length - 1]);
        await SeleniumBrowser.instance.waitForWorkbench();
        Workbench.openFolder = undefined;
    }

    async closeFolder(): Promise<void> {
        const browser = SeleniumBrowser.instance;
        const handles = await browser.driver.getAllWindowHandles();

        if (handles.length === 1) {
            console.warn('Cannot close last tab (folder).');
            return;
        }

        await browser.driver.close();
        await browser.driver.switchTo().window(handles[handles.length - 2]);
        await SeleniumBrowser.instance.waitForWorkbench();
    }

    async getOpenDialog(): Promise<IOpenDialog> {
        return DialogHandler.getOpenDialog();
    }
}
