import { error, Key } from 'extension-tester-page-objects';
import {
    Locator,
    TheiaElement,
    TheiaLocator,
    WebElement
} from '../../../../module';
import { repeat } from '@theia-extension-tester/repeat';
import { Scroll } from './Scroll';

export enum ScrollDirection {
    NEXT, PREVIOUS, NONE
}

export class ScrollItemNotFound extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'ScrollItemNotFound';
    }
};

export type ScrollComparator<T extends TheiaElement> = (scrollItem: T) => PromiseLike<number> | number;
export type ScrollPredicate<T extends TheiaElement> = (scrollItem: T) => PromiseLike<boolean> | boolean;
export type ScrollFilter<T extends TheiaElement> = (scrollItem: T) => PromiseLike<boolean> | boolean;

/**
 * Base widget representing components with scroll bar.
 */
export abstract class ScrollableWidget<T extends TheiaElement> extends TheiaElement {
    /**
     * 
     * @param element main component
     * @param parent parent component
     * @param usePageKeys use page keys instead of scroll element
     */
    constructor(element: WebElement | Locator | TheiaLocator, parent?: WebElement, private usePageKeys: boolean = false) {
        super(element, parent);
    }

    /**
     * Return true if items are available.
     */
    abstract hasItems(): Promise<boolean>;
    /**
     * Get all items rendered in DOM.
     */
    protected abstract getItems(): Promise<T[]>;
    /**
     * Get active item. 
     */
    abstract getActiveItem(): Promise<T>;

    /**
     * Get vertical scroll component.
     */
    protected abstract getVerticalScroll(): Promise<Scroll>;
    /**
     * Get horizontal scroll component.
     */
    protected abstract getHorizontalScroll(): Promise<Scroll>;

    /**
     * Check if vertical scroll is rendered.
     */
    protected abstract hasVerticalScroll(): Promise<boolean>;
    /**
     * Check if horizontal scroll is rendered.
     */
    protected abstract hasHorizontalScroll(): Promise<boolean>;

    protected async getElementId(element: T): Promise<string> {
        return element.getId();
    }

    /**
     * Return controller element.
     * @returns item which will receive sendKeys method call. 
     */
    protected async getControllerElement(): Promise<TheiaElement> {
        return this;
    }

    protected async findOffset(node: T, elements?: T[]): Promise<{ index: number, items: T[] }> {
        let counter = 0;
        const items = elements || await this.getVisibleItems();
        const id = await node.getId();
        let found = false;

        for (const item of items) {
            if (await item.getId() === id) {
                found = true;
                break;
            }
            counter += 1;
        }
        return {
            index: found ? counter : -1,
            items
        };
    }

    /**
     * Check if another page is available.
     * @param direction direction of next page.
     * @returns boolean indicating availability of page
     */
    async hasAnotherPage(direction: ScrollDirection): Promise<boolean> {
        const hasVerticalScroll = await this.hasVerticalScroll();
        const hasItems = await this.hasItems();

        if (hasVerticalScroll === false || hasItems === false) {
            return false;
        }

        const scroll = await this.getVerticalScroll();

        if (direction === ScrollDirection.NEXT) {
            return await scroll.isScrollOnEnd() === false;
        }

        if (direction === ScrollDirection.PREVIOUS) {
            return await scroll.isScrollOnStart() === false;
        }

        throw new Error(`Unexpected direction "${direction}".`);
    }

    /**
     * 
     * @returns true if next page is available
     */
    async hasNextPage(): Promise<boolean> {
        return await this.hasAnotherPage(ScrollDirection.NEXT);
    }

    /**
     * 
     * @returns true if previous page is available.
     */
    async hasPreviousPage(): Promise<boolean> {
        return await this.hasAnotherPage(ScrollDirection.PREVIOUS);
    }

    /**
     * Change page according to direction.
     * @param direction 
     * @param lastActiveItem Last visible item on list (if direction is next).
     * @param timeout 
     * @returns visible items on another page.
     */
    async movePage(direction: ScrollDirection, lastActiveItem: T, timeout?: number): Promise<T[]> {
        let directionWord: string;

        if (direction === ScrollDirection.NEXT) {
            directionWord = 'next';
        }
        else if (direction === ScrollDirection.PREVIOUS) {
            directionWord = 'previous';
        }
        else {
            directionWord = 'none direction'
        }

        if (direction === ScrollDirection.NONE) {
            throw new Error(`Cannot get ${directionWord} page.`);
        }

        if (await this.hasAnotherPage(direction) === false) {
            throw new Error(`Cannot get ${directionWord} page.`);
        }

        const scroll = await this.getVerticalScroll();

        if (direction === ScrollDirection.NEXT) {
            if (this.usePageKeys === false) {
                await scroll.scrollAfter(lastActiveItem, this, timeout);
            }
            else {
                const element = await this.getControllerElement();
                await element.safeSendKeys(timeout, Key.PAGE_DOWN);
            }
        }
        else if (direction === ScrollDirection.PREVIOUS) {
            if (this.usePageKeys === false) {
                await scroll.scroll(Math.ceil(-await scroll.getScrollSize() / 2), timeout);
            }
            else {
                const element = await this.getControllerElement();
                await element.safeSendKeys(timeout, Key.PAGE_UP);
            }
        }

        return await this.getVisibleItems();
    }

    /**
     * Change to next page.
     * @param lastItem last visible item on list 
     * @param timeout 
     * @returns visible items on next page
     */
    async nextPage(lastItem: T, timeout?: number): Promise<T[]> {
        if (await this.hasNextPage() === false) {
            throw new Error('Could not get next page.');
        }

        return await this.movePage(ScrollDirection.NEXT, lastItem, timeout);
    }

    /**
     * Change to previous page.
     * @param firstItem first visible item on list 
     * @param timeout 
     * @returns visible items on previous page
     */
    async previousPage(firstItem: T, timeout?: number): Promise<T[]> {
        if (await this.hasPreviousPage() === false) {
            throw new Error('Could not get previous page.');
        }
        return await this.movePage(ScrollDirection.PREVIOUS, firstItem, timeout);
    }

    async getVisibleItems(): Promise<T[]> {
        return await repeat (async () => {
            if (await this.hasItems() === false) {
                return [];
            }

            const items: T[] = [];
    
            for (const item of await this.getItems()) {
                const displayed = await item.isDisplayed().catch(() => false);
    
                if (!displayed) {
                    continue;
                }
                items.push(item);
            }

            // Assuming clear pages are not part of program.
            if (items.length === 0) {
                return undefined;
            }

            return items;
        }, {
            timeout: this.timeoutManager().defaultTimeout(),
            message: 'Could load collection items on time.'
        }) as T[];
    }

    /**
     * Reset scroll to beginning.
     */
    async resetScroll(): Promise<void> {
        if (await this.hasVerticalScroll() === false) {
            return;
        }

        const scroll = await this.getVerticalScroll();
        await scroll.scroll(- await scroll.getScrollPosition());
    }

    /**
     * Scroll through all elements and call callback per each item.
     * @param callback callback to be called. If callback function returns false, iteration is stopped.
     * @param timeout 
     * @param errorMessage 
     */
    async iterateItems(callback: (item: T) => PromiseLike<boolean> | boolean, timeout?: number, errorMessage?: string): Promise<void> {
        let items = await this.getVisibleItems();

        await repeat(async () => {
            for (const item of items) {                
                const value = await callback(item);

                if (value === false) {
                    // stop repeat
                    return true;
                }
            }
            if (await this.hasNextPage() && items.length > 0) {
                items = await this.nextPage(items[items.length - 1], timeout);
                return false;
            }
            else {
                return true;
            }
        }, {
            timeout: this.timeoutManager().findElementTimeout(timeout),
            message: errorMessage
        });
    }

    /**
     * Find items sequentially and scroll to next pages if required.
     * @param predicate predicate to be checked
     * @param timeout 
     * @param message error message if items is not found on time.
     * @returns promise resolving to found item
     */
    async findItemSequentially(predicate: ScrollPredicate<T>, timeout?: number, message?: string): Promise<T> {
        let foundItem: T | undefined;

        async function callback(item: T) {
            if (await predicate(item)) {
                foundItem = item;
                return false;
            }
            return true;
        }

        await this.iterateItems(callback.bind(this), timeout, message);
        if (foundItem === undefined) {
            throw new ScrollItemNotFound(message);
        }

        return foundItem;
    }

    async findItemWithComparatorDetailed(comparator: ScrollComparator<T>, timeout?: number, message?: string): Promise<{ index: number, items: T[] }> {
        let items = await this.getVisibleItems();

        return await repeat(async () => {
            try {
                if (items.length === 0) {
                    throw new ScrollItemNotFound('Item was not found. Tree is empty.');
                }

                if (items.length === 1) {
                    if (await comparator(items[0]) === 0) {
                        return { index: 0, items };
                    }
                    else {
                        throw new ScrollItemNotFound('Item was not found.');
                    }
                }

                let firstItemCompareResult: number = await comparator(items[0]);
                let lastItemCompareResult: number = await comparator(items[items.length - 1]);

                if (firstItemCompareResult < 0 && lastItemCompareResult > 0) {
                    throw new Error('Illegal comparator combination.');
                }

                if (firstItemCompareResult === 0) {
                    return { index: 0, items };
                }

                if (lastItemCompareResult === 0) {
                    return { index: items.length - 1, items };
                }

                // comparator value = searching element - currentElement
                if (firstItemCompareResult < 0 && lastItemCompareResult < 0) {
                    if (await this.hasPreviousPage()) {
                        items = await this.previousPage(items[0], timeout);
                        return undefined;
                    }
                    throw new ScrollItemNotFound('There are not previous pages available.');
                }
                else if (firstItemCompareResult > 0 && lastItemCompareResult > 0) {
                    if (await this.hasNextPage()) {
                        items = await this.nextPage(items[items.length - 1], timeout);
                        return undefined;
                    }

                    throw new ScrollItemNotFound('There are not next pages available.');
                }
                else {
                    return await this.comparatorBinarySearch(comparator, items);
                }
            }
            catch (e) {
                if (e instanceof error.StaleElementReferenceError) {
                    items = await this.getVisibleItems();
                    return undefined;
                }
                throw e;
            }
        }, {
            timeout, message: message ?? 'Could not find scroll item on time.'
        }) as { index: number, items: T[] };
    }

    /**
     * Find items using binary search. Items must be sorted.
     * @param comparator items comparator
     * @param timeout 
     * @param message error message if item is not found on time.
     * @returns promise resolving to found item.
     */
    async findItemWithComparator(comparator: ScrollComparator<T>, timeout?: number, message?: string): Promise<T> {
        const result = await this.findItemWithComparatorDetailed(comparator, timeout, message);
        return result.items[result.index];
    }

    async comparatorBinarySearch<T extends TheiaElement>(comparator: ScrollComparator<T>, items: T[]): Promise<{ index: number, items: T[] }> {
        // first and last item were already checked
        let left: number = 1;
        let right: number = items.length - 2;

        while (left <= right) {
            const median = Math.floor((left + right) / 2);

            const comparatorValue = await comparator(items[median]);

            if (comparatorValue > 0) {
                left = median + 1;
            }
            else if (comparatorValue < 0) {
                right = median - 1;
            }
            else {
                return { index: median, items };
            }
        }

        throw new ScrollItemNotFound('Could not find scroll item.');
    }
}


