import {
    IMenu,
    IMenuItem,
    TheiaElement,
    WebElement
} from '../../../module';

export abstract class MenuItem extends TheiaElement implements IMenuItem {
    constructor(element: WebElement, parent: IMenu) {
        super(element, parent);
    }

    abstract getNextMenu(): Promise<IMenu>;

    async select(): Promise<IMenu | undefined> {
        const nesting = await this.isNesting();
        await this.safeClick();
        if (nesting) {
            return await this.getNextMenu();
        }
        else {
            return undefined;
        }
    }

    getParent(): IMenu {
        return this.enclosingItem as IMenu;
    }

    async getLabel(): Promise<string> {
        const element = await this.findElement(TheiaElement.locators.components.menu.label);
        return element.getText();
    }

    abstract isNesting(): Promise<boolean>;
}
