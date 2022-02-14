import { repeat } from '@theia-extension-tester/repeat';
import assert = require('assert');
import { TheiaElement, WebElement } from '../../../../module';

export interface Scroll extends TheiaElement {
    getScrollPosition(): Promise<number>;
    getScrollSize(): Promise<number>;
    getScrollContainerSize(): Promise<number>
    isScrollOnEnd(): Promise<boolean>;
    isScrollOnStart(): Promise<boolean>;
    scroll(value: number, timeout?: number): Promise<void>
    scrollTo(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void>;
    scrollAfter(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void>;
    scrollBefore(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void>;
}

export abstract class ScrollWidget extends TheiaElement implements Scroll {
    constructor(element: WebElement, parent: TheiaElement) {
        super(element, parent);
    }

    abstract getScrollPosition(): Promise<number>;
    abstract getScrollSize(): Promise<number>;
    abstract getScrollContainerSize(): Promise<number>;
    abstract scroll(value: number, timeout?: number): Promise<void>
    abstract scrollTo(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void>;
    abstract scrollAfter(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void>;
    abstract scrollBefore(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void>;

    protected async waitForPositionChange(expectedPosition: number, timeout?: number): Promise<void> {
        const size = await this.getScrollSize() / 4;
        await repeat(async () => {
            const currentPosition = await this.getScrollPosition();
            return Math.abs(currentPosition - expectedPosition) <= size;
        }, {
            timeout: this.timeoutManager().findElementTimeout(timeout),
            message: `Scroll has not changed position.\nExpected: ${expectedPosition}.\nActual: ${await this.getScrollPosition()}.`
        });
    }

    protected async getScrollDelta(value: number): Promise<number> {
        if (value === 0) {
            return 0;
        }

        const containerSize = await this.getScrollContainerSize();
        const scrollSize = await this.getScrollSize();
        const scrollPosition = await this.getScrollPosition();

        if (value > 0) {
            value = Math.min(value, containerSize - (scrollSize + scrollPosition));
        }
        else {
            value = Math.min(Math.abs(value), scrollPosition);
            value = -value;
        }

        return value;
    }

    protected async getContainer(): Promise<TheiaElement> {
        const element = await this.enclosingItem;

        if (element instanceof TheiaElement) {
            return element;
        }
        else {
            throw new Error('Enclosing item must be TheiaElement.');
        }
    }

    async isScrollOnEnd(): Promise<boolean> {
        const position = await this.getScrollPosition();
        const size = await this.getScrollSize();
        const containerSize = await this.getScrollContainerSize();
        return (position + size) === containerSize;
    }

    async isScrollOnStart(): Promise<boolean> {
        const position = await this.getScrollPosition();
        return position === 0;
    }
}

export class HorizontalScrollWidget extends ScrollWidget {
    scrollTo(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    scrollAfter(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    scrollBefore(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async scroll(value: number, timeout?: number): Promise<void> {
        if (value === 0) {
            return;
        }
        value = await this.getScrollDelta(value);
        const expectedPosition = await this.getScrollPosition() + value;

        await this.getDriver().actions().mouseDown(this).mouseMove({ x: value, y: 0 }).mouseUp(this).perform();
        await this.waitForPositionChange(expectedPosition, timeout);
    }
    async getScrollPosition(): Promise<number> {
        const element = await this.enclosingItem;
        const containerLocation = await element.getLocation();
        const location = await this.getLocation();
        return location.x - containerLocation.x;
    }
    async getScrollSize(): Promise<number> {
        return (await this.getSize()).width;
    }
    async getScrollContainerSize(): Promise<number> {
        const element = await this.getContainer();
        return (await element.getSize()).width;
    }
}

export class VerticalScrollWidget extends ScrollWidget {
    async scroll(value: number, timeout?: number): Promise<void> {
        if (value === 0) {
            return;
        }

        value = await this.getScrollDelta(value);
        const expectedPosition = await this.getScrollPosition() + value;
        await this.getDriver().actions().mouseDown(this).mouseMove({ x: 0, y: value }).mouseUp(this).perform();
        await this.waitForPositionChange(expectedPosition, timeout);
    }

    private async getScrollValue(node: TheiaElement, parent?: WebElement, bias: number = 0) {
        parent = parent || node.getEnclosingElement();

        const scrollSize = await this.getScrollSize();

        const parentY = (await parent.getLocation()).y;
        const nodeY = (await node.getLocation()).y
        const scrollDistance = (nodeY - parentY) + bias;

        return Math.ceil((scrollDistance / (await parent.getSize()).height) * scrollSize);
    }

    async scrollTo(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void> {
        await this.scroll(await this.getScrollValue(node, parent, 0), timeout);
    }
    async scrollAfter(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void> {
        await this.scroll(await this.getScrollValue(node, parent, (await node.getSize()).height), timeout);
    }
    async scrollBefore(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void> {
        await this.scroll(await this.getScrollValue(node, parent, -((await node.getSize()).height)), timeout);
    }

    async getScrollPosition(): Promise<number> {
        const element = await this.enclosingItem;
        const containerLocation = await element.getLocation();
        const location = await this.getLocation();
        return location.y - containerLocation.y;
    }
    async getScrollSize(): Promise<number> {
        return (await this.getSize()).height;
    }
    async getScrollContainerSize(): Promise<number> {
        const element = await this.getContainer();
        return (await element.getSize()).height;
    }
}

export abstract class HTMLScroll extends TheiaElement implements Scroll {
    abstract scrollTo(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void>;
    abstract scrollAfter(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void>;
    abstract scrollBefore(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void>;
    abstract getScrollPosition(): Promise<number>;
    abstract getScrollContainerSize(): Promise<number>;
    protected abstract getScrollEnd(): Promise<number>;
    protected abstract set(value: number): Promise<void>;

    abstract getScrollSize(): Promise<number>;

    async isScrollOnStart(): Promise<boolean> {
        return await this.getScrollPosition() === 0;
    }

    async isScrollOnEnd(): Promise<boolean> {
        const position = await this.getScrollPosition();
        const clientHeight = await this.getScrollContainerSize();
        const scrollHeight = await this.getScrollEnd();
        console.log(`${clientHeight} >= ${scrollHeight} - ${position}`);
        
        return clientHeight >= scrollHeight - position;
    }

    async scroll(value: number, timeout?: number): Promise<void> {
        if (value === 0) {
            return;
        }

        const position = await this.getScrollPosition();
        const newPosition = position + value;
        value = value > 0 ? Math.min(newPosition, await this.getScrollEnd()) : Math.max(0, newPosition);
        await this.set(value);
        await repeat(async () => await this.getScrollPosition() === value, {
            timeout: this.timeoutManager().findElementTimeout(timeout),
            message: `Scroll has not changed position.\nExpected: ${value}.\nActual: ${await this.getScrollPosition()}.`
        });
    }
}

export class HTMLVerticalScroll extends HTMLScroll implements Scroll {
    async isDisplayed(): Promise<boolean> {
        const result = await super.isDisplayed();

        if (!result) {
            return false;
        }

        return await this.getDriver().executeScript<number>('arguments[0].scrollTop', this) !== null;
    }

    getScrollSize(): Promise<number> {
        throw new Error('Vertical scroll bar size cannot be calculated.');
    }
    scrollTo(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    scrollAfter(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    scrollBefore(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    protected async set(value: number): Promise<void> {
        await this.getDriver().executeScript<number>(`arguments[0].scrollTop = ${value}`, this);
    }
    async getScrollPosition(): Promise<number> {
        const result = await this.getDriver().executeScript<number>('arguments[0].scrollTop', this);
        assert(result, 'arguments[0].scrollTop is null')
        return result;
    }

    protected async getScrollEnd(): Promise<number> {
        const result = await this.getDriver().executeScript<number>('arguments[0].scrollHeight', this);
        assert(result, 'arguments[0].scrollHeight is null')
        return result;
    }

    async getScrollContainerSize(): Promise<number> {
        const result = (await this.getSize()).height;
        return result;
    }
}

export class HTMLHorizontalScroll extends HTMLScroll implements Scroll {
    scrollTo(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    scrollAfter(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    scrollBefore(node: TheiaElement, parent?: TheiaElement, timeout?: number): Promise<void> {
        throw new Error('Method not implemented.');
    }
    protected async set(value: number): Promise<void> {
        await this.getDriver().executeScript<number>(`arguments[0].scrollLeft = ${value}`, this);
    }

    async getScrollPosition(): Promise<number> {
        const result =  await this.getDriver().executeScript<number>('arguments[0].scrollLeft', this);
        assert(result, 'arguments[0].scrollLeft is null');
        return result;
    }

    protected async getScrollEnd(): Promise<number> {
        const result =  await this.getDriver().executeScript<number>('arguments[0].scrollWidth', this);
        assert(result, 'arguments[0].scrollWidth is null');
        return result;
    }

    async getScrollContainerSize(): Promise<number> {
        return (await this.getSize()).width;
    }

    async getScrollSize(): Promise<number> {
        const result =  await this.getDriver().executeScript<number>('arguments[0].offsetWidth - arguments[0].clientWidth', this);
        assert(result, 'arguments[0].offsetWidth - arguments[0].clientWidth is null');
        return result;
    }

    async isDisplayed(): Promise<boolean> {
        const result = await super.isDisplayed();

        if (!result) {
            return false;
        }

        return await this.getDriver().executeScript<number>('arguments[0].scrollLeft', this) !== null;
    }
}