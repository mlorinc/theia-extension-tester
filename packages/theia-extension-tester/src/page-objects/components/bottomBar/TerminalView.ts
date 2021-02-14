import { ITerminalView} from 'extension-tester-page-objects';
import { TheiaElement } from '../../theia-components/TheiaElement';
import { Menu } from '../menu/Menu';

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
    async openContextMenu(): Promise<Menu> {
        throw new Error('Method not implemented.');
    }
    async getText(): Promise<string> {
        throw new Error('Method not implemented.');
    }
}
