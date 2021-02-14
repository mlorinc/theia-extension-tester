import { LocatorLoader } from "extension-tester-page-objects";
import { TheiaLocators } from "./locators/TheiaLocators";

export class TheiaLocatorLoader extends LocatorLoader<TheiaLocators> {
    protected parseVersion(version: string): string {
        return version;
    }

    constructor(version: string, baseVersion: string, baseFolder: string) {
        super(version, baseVersion, baseFolder);
    }
}
