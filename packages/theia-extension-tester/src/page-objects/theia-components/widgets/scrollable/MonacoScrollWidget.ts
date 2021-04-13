import { WebElement } from "selenium-webdriver";
import { TheiaElement } from "../../TheiaElement";
import { ScrollWidget, VerticalScrollWidget } from "./Scroll";
import { ScrollableWidget } from "./ScrollableWidget";

export abstract class MonacoScrollWidget<T extends TheiaElement> extends ScrollableWidget<T> {
    private verticalScroll?: ScrollWidget;
    private horizontalScroll?: ScrollWidget;

    constructor(element: WebElement | undefined, parent: WebElement) {
        super(element ?? MonacoScrollWidget.locators.widgets.monacoScroll.constructor, parent);
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

    protected async getVerticalScroll(): Promise<ScrollWidget> {
        if (this.verticalScroll) {
            return this.verticalScroll;
        }
        
        const scrollLocator = MonacoScrollWidget.locators.widgets.monacoScroll.verticalScroll;
        const container = this.getEnclosingElement() as TheiaElement;

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
        const container = this.getEnclosingElement() as TheiaElement;

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