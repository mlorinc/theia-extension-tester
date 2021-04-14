import { ContextMenu, IMenu, MenuItem } from '../../../module';

export class TitleBarItem extends MenuItem {
    async getNextMenu(): Promise<IMenu> {
        return new ContextMenu();
    }
    async isNesting(): Promise<boolean> {
        return true;
    }
}
