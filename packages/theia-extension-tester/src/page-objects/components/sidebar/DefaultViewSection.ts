import { IViewItem } from "extension-tester-page-objects";
import { ViewSection } from "./ViewSection";

export class DefaultViewSection extends ViewSection {
    getVisibleItems(): Promise<IViewItem[]> {
        throw new Error("Method not implemented.");
    }
    findItem(label: string, maxLevel?: number): Promise<IViewItem | undefined> {
        throw new Error("Method not implemented.");
    }
    openItem(...path: string[]): Promise<IViewItem[]> {
        throw new Error("Method not implemented.");
    }
}
