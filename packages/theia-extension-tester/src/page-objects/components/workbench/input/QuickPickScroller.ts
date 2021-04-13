import { Input } from './Input';
import { QuickPickItem } from './QuickPickItem';
import { TheiaElement } from '../../../theia-components/TheiaElement';
import { MonacoScrollWidget } from '../../../theia-components/widgets/scrollable/MonacoScrollWidget';
import { ScrollItemNotFound } from '../../../theia-components/widgets/scrollable/ScrollableWidget';

export class QuickPickScroller extends MonacoScrollWidget<QuickPickItem> {
    private input: Input;

    constructor(input: Input) {
        const container = input.getEnclosingElement();
        super(undefined, container);
        this.input = input;
    }

    protected async getElementId(element: QuickPickItem): Promise<string> {
        return element.getLabel();
    }

    async length(): Promise<number> {  
        const counter = await this.input.getEnclosingElement().findElement(QuickPickScroller.locators.components.workbench.input.counter);
        const text = await counter.getAttribute('innerText');
        const [count, ..._] = text.split(/\s+/);
        return Number.parseInt(count);
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
            console.log(`Comparing "${value}" with "${indexOrText}".`);

            if (typeof indexOrText === 'string') {
                return (value as string).localeCompare(indexOrText);
            }
            else {
                if (value === indexOrText) {
                    return 0;
                }
                else if (value > indexOrText) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
        }

        await this.resetScroll();

        // handle recently used quick pick
        const items = await this.getVisibleItems();

        if (items.length === 0) {
            throw new ScrollItemNotFound('Quick pick list is empty.');
        }

        for (const item of items) {
            if (await comparator(item) === 0) {
                return item;
            }
        }

        const errorMessage = `Could not find quick pick with ${typeof indexOrText === 'string' ? 'label' : 'index'} "${indexOrText}".`;

        if (this.hasNextPage()) {
            await this.nextPage(items[items.length - 1], timeout);
            return await this.findItemWithComparator(comparator.bind(this), timeout, errorMessage);
        }
        else {
            throw new ScrollItemNotFound(errorMessage);
        }
    }
}
