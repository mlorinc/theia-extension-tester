import {
    getTimeout,
    ScrollableWidget,
    ScrollWidget,
    TheiaElement,
    VerticalScrollWidget,
    WebElement
} from '../../../../module';

export abstract class MonacoScrollWidget<T extends TheiaElement> extends ScrollableWidget<T> {
    private verticalScroll?: ScrollWidget;
    private horizontalScroll?: ScrollWidget;

    constructor(element: WebElement | undefined, parent: WebElement, usePageKeys: boolean = false) {
        super(element ?? MonacoScrollWidget.locators.widgets.monacoScroll.constructor, parent, usePageKeys);
        this.mapItem = this.mapItem.bind(this);
    }

    protected abstract mapItem(element: TheiaElement): Promise<T>;

    async getItems(): Promise<T[]> {
        const items = await this.findElements(MonacoScrollWidget.locators.widgets.monacoScroll.item) as TheiaElement[];
        return Promise.all(items.map(this.mapItem));
    }

    async getActiveItem(): Promise<T> {
        for (const item of await this.getVisibleItems()) {
            if (await item.isFocused()) {
                return item;
            }
        }
        throw new Error('Could not find active item.');
    }

    private async getParent(): Promise<TheiaElement> {
        return await this.getDriver().wait(() => this.enclosingItem, getTimeout(), 'Could not get enclosing element.') as TheiaElement;
    }

    protected async getVerticalScroll(): Promise<ScrollWidget> {
        if (this.verticalScroll) {
            return this.verticalScroll;
        }

        const scrollLocator = MonacoScrollWidget.locators.widgets.monacoScroll.verticalScroll;
        const container = await this.getParent();

        const scrollContainer = await container.findElement(scrollLocator.container) as TheiaElement;
        const scrollElement = await scrollContainer.findElement(scrollLocator.constructor);

        this.verticalScroll = new VerticalScrollWidget(scrollElement, scrollContainer);
        return this.verticalScroll;
    }

    protected async getHorizontalScroll(): Promise<ScrollWidget> {
        if (this.horizontalScroll) {
            return this.horizontalScroll;
        }

        const scrollLocator = MonacoScrollWidget.locators.widgets.monacoScroll.verticalScroll;
        const container = await this.getParent();

        const scrollContainer = await container.findElement(scrollLocator.container) as TheiaElement;
        const scrollElement = await scrollContainer.findElement(scrollLocator.constructor);

        this.horizontalScroll = new VerticalScrollWidget(scrollElement, scrollContainer);
        return this.horizontalScroll;
    }

    protected async hasVerticalScroll(): Promise<boolean> {
        const scroll = await this.getVerticalScroll();
        return await scroll.isDisplayed();
    }

    protected async hasHorizontalScroll(): Promise<boolean> {
        const scroll = await this.getHorizontalScroll();
        return await scroll.isDisplayed();
    }
}
