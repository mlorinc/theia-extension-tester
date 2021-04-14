import { getTimeout, TheiaElement, WebElement } from '../../../../module';

export interface Scroll extends TheiaElement {
    getScrollPosition(): Promise<number>;
    getScrollSize(): Promise<number>;
    getScrollContainerSize(): Promise<number>
    isScrollOnEnd(): Promise<boolean>;
    isScrollOnStart(): Promise<boolean>;
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
        await this.getDriver().wait(async () => {
            const currentPosition = await this.getScrollPosition();
            return Math.abs(currentPosition - expectedPosition) <= size;
        }, getTimeout(timeout), `Scroll has not changed position.\nExpected: ${expectedPosition}.\nActual: ${await this.getScrollPosition()}.`);
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

    protected getContainer(): TheiaElement {
        return this.enclosingItem as TheiaElement;
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
        const containerLocation = await this.enclosingItem.getLocation();
        const location = await this.getLocation();
        return location.x - containerLocation.x;
    }
    async getScrollSize(): Promise<number> {
        return (await this.getSize()).width;
    }
    async getScrollContainerSize(): Promise<number> {
        return (await this.getContainer().getSize()).width;
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

    private async getScrollValue(node: TheiaElement, parent?: TheiaElement, bias: number = 0) {
        parent = parent || node.getEnclosingElement() as TheiaElement;

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
        const containerLocation = await this.enclosingItem.getLocation();
        const location = await this.getLocation();
        return location.y - containerLocation.y;
    }
    async getScrollSize(): Promise<number> {
        return (await this.getSize()).height;
    }
    async getScrollContainerSize(): Promise<number> {
        return (await this.getContainer().getSize()).height;
    }
}
