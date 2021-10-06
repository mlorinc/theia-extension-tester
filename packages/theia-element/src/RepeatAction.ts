import { Button } from "extension-tester-page-objects";
import { Threshold } from "@theia-extension-tester/repeat";
import { TheiaElement } from ".";

export class ElementRepeatAction {
    private timer: Threshold;

    constructor(private element: TheiaElement, private interval: number) {
        this.timer = new Threshold(interval);
    }

    async click(button: string = Button.LEFT): Promise<void> {
        if (this.timer.resetCount === 0 || this.timer.hasFinished()) {
            await this.element.safeClick(button);
            this.timer.reset();
        }
    }

    async sendKeys(...var_args: (string | number | Promise<string | number>)[]): Promise<void> {
        if (this.timer.resetCount === 0 || this.timer.hasFinished()) {
            await this.element.sendKeys(...var_args);
            this.timer.reset();
        }
    }

    async perform(action: () => void | PromiseLike<void>): Promise<void> {
        if (this.timer.resetCount === 0 || this.timer.hasFinished()) {
            await action();
            this.timer.reset();
        }
    }

    reset(): void {
        this.timer = new Threshold(this.interval);
    }
}
