import { IMenu } from "extension-tester-page-objects";
import { ContextMenu } from "./ContextMenu";
import { MenuItem } from "./MenuItem";

export class TitleBarItem extends MenuItem {
    async getNextMenu(): Promise<IMenu> {
        return new ContextMenu();
    }
    async isNesting(): Promise<boolean> {
        return true;
    }
}
