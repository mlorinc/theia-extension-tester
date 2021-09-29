import { IContextMenu, ITerminalView, TheiaElement } from "../../../module";

/**
 * Terminal view on the bottom panel
 */
export class TerminalView extends TheiaElement implements ITerminalView {
    async executeCommand(command: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async killTerminal(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async newTerminal(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async getChannelNames(): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
    async getCurrentChannel(): Promise<string> {
        throw new Error('Method not implemented.');
    }
    async selectChannel(name: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    async openContextMenu(): Promise<IContextMenu> {
        throw new Error('Method not implemented.');
    }
    async getText(): Promise<string> {
        throw new Error('Method not implemented.');
    }
}
