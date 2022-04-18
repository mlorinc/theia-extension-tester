import {
    Input,
    MonacoScrollWidget,
    QuickPickItem,
    ScrollItemNotFound,
    TheiaElement
} from '../../../../module';
import { repeat } from '@theia-extension-tester/repeat';
import { TimeoutError } from '@theia-extension-tester/timeout-promise';
import { By } from '@theia-extension-tester/theia-element';

export class QuickPickScroller extends MonacoScrollWidget<QuickPickItem> {
    private input: Input;

    constructor(input: Input) {
        const container = input.getEnclosingElement();
        super(undefined, container);
        this.input = input;
    }

    async hasItems(): Promise<boolean> {
        const element = await this.input.findElements(By.xpath(".//*[text() = 'No matching results']")).catch(() => []);
        return element.length === 0;
    }

    protected async getElementId(element: QuickPickItem): Promise<string> {
        return element.getLabel();
    }

    async length(): Promise<number> {
        const counter = await this.input.getCounter();
        const text = await counter.getAttribute('innerText');
        return Number.parseInt(text.split(/\s+/)[0]);
    }

    protected async mapItem(item: TheiaElement): Promise<QuickPickItem> {
        return new QuickPickItem(item, this);
    }

    async isLastItem(item: QuickPickItem) {
        return await item.getIndex() === await this.length();
    }

    async isFirstItem(item: QuickPickItem) {
        return await item.getIndex() === 1;
    }

    async findItem(indexOrText: string | number, timeout?: number): Promise<QuickPickItem> {
        async function comparator(item: QuickPickItem): Promise<number> {
            const value = typeof indexOrText === 'string' ? await item.getLabel() : await item.getIndex();
            if (typeof indexOrText === 'string') {
                return indexOrText.localeCompare(value as string);
            }
            else {
                return indexOrText - (value as number);
            }
        }

        await this.resetScroll();

        // handle recently used quick pick
        let items: QuickPickItem[];
        try {
            items = await repeat(async () => {
                const items = await this.getVisibleItems();
                if (items.length > 0) {
                    return items;
                }
                else {
                    return undefined;
                }
            }, {
                timeout
            }) as QuickPickItem[];
        }
        catch (e) {
            if (e instanceof TimeoutError) {
                items = [];
            }
            else {
                throw e;
            }
        }

        if (items.length === 0) {
            throw new ScrollItemNotFound('Quick pick list is empty.');
        }

        for (const item of items) {
            if (await comparator(item) === 0) {
                return item;
            }
        }

        const errorMessage = `Could not find quick pick with ${typeof indexOrText === 'string' ? 'label' : 'index'} "${indexOrText}".`;
        const scroll = await this.getVerticalScroll();
        const scrollSize = await scroll.getScrollSize().catch(() => 0);

        // index scroll position heuristic
        if (typeof indexOrText === 'number' && scrollSize > 0) {
            const quickPickHeight = (await items[0].getSize()).height;

            const pickPercentage = quickPickHeight / (await this.getSize()).height;

            const scrollSize = await scroll.getScrollSize();
            const indexDelta = indexOrText - (await items[items.length - 1].getIndex());

            await scroll.scroll(Math.ceil(pickPercentage * scrollSize * indexDelta));
            return await this.findItemWithComparator(comparator.bind(this), timeout, errorMessage);
        }
        else if (await this.hasNextPage()) {
            await this.nextPage(timeout);
            return await this.findItemWithComparator(comparator.bind(this), timeout, errorMessage);
        }
        else {
            throw new ScrollItemNotFound(errorMessage);
        }
    }
}
