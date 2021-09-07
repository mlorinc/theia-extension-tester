import { TheiaElement, until } from '../../../../module';

export abstract class TreeNode extends TheiaElement {
    constructor(element: TheiaElement, parent: TheiaElement) {
        super(element, parent);
    }

    abstract isExpanded(): Promise<boolean>;
    abstract getLabel(): Promise<string>;

    async isSelected(): Promise<boolean> {
        if (TreeNode.locators.widgets.tree.node.properties?.selected) {
            return await TreeNode.locators.widgets.tree.node.properties?.selected(this, TreeNode.locators);
        }
        else {
            throw new Error('TreeNode.locators.widgets.tree.node.properties.selected is undefined.');
        }
    }

    async isFocused(): Promise<boolean> {
        if (TreeNode.locators.widgets.tree.node.properties?.focused) {
            return await TreeNode.locators.widgets.tree.node.properties?.focused(this, TreeNode.locators);
        }
        else {
            throw new Error('TreeNode.locators.widgets.tree.node.properties.focused is undefined.');
        }
    }

    async isExpandable(): Promise<boolean> {
        if (TreeNode.locators.widgets.tree.node.properties?.expandable) {
            return await TreeNode.locators.widgets.tree.node.properties?.expandable(this, TreeNode.locators);
        }
        else {
            throw new Error('TreeNode.locators.widgets.tree.node.properties.expandable is undefined.');
        }
    }

    async isEnabled(): Promise<boolean> {
        if (TreeNode.locators.widgets.tree.node.properties?.enabled) {
            return await TreeNode.locators.widgets.tree.node.properties?.enabled(this, TreeNode.locators);
        }
        else {
            throw new Error('TreeNode.locators.widgets.tree.node.properties.enabled is undefined.');
        }
    }

    async focus(): Promise<void> {
        await this.getDriver().wait(async (driver) => {
            if (await this.isFocused()) {
                return true;
            }

            await driver.executeScript('arguments[0].focus()', this);
            return false;
        });
    }

    async getTreeDepth(): Promise<number> {
        const elements = await this.enclosingItem.findElements(TreeNode.locators.widgets.tree.indent);
        return elements.length;
    }

    protected async toggle(state: boolean): Promise<void> {
        const operation = state ? 'expand' : 'collapse';

        if (await this.isExpandable() === false) {
            throw new Error(`Cannot ${operation} element with label "${await this.getLabel()}".`);
        }

        await this.getDriver().wait(
            until.elementIsEnabled(this),
            this.timeoutManager().defaultTimeout(),
            `Folder with label "${await this.getLabel()}" is not enabled.`
        );

        if (await this.isExpanded() !== state) {
            await this.safeClick();
            await this.getDriver().wait(
                async () => await this.isExpanded() === state, this.timeoutManager().defaultTimeout(),
                `Could not ${operation} element with label "${await this.getLabel()}".`
            );
            await this.getDriver().wait(
                until.elementIsEnabled(this),
                this.timeoutManager().defaultTimeout(),
                `Folder with label "${await this.getLabel()}" has not finished loading.`
            );
        }
    }

    async expand(): Promise<void> {
        await this.toggle(true);
    }

    async collapse(): Promise<void> {
        await this.toggle(false);
    }
}
