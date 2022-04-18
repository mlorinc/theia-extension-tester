import { LocatorLoader } from "@theia-extension-tester/locator-loader";
import { TheiaLocators } from "@theia-extension-tester/theia-element";

export class TheiaLocatorLoader extends LocatorLoader<TheiaLocators> {
    protected parseVersion(version: string): string {
        return version;
    }

    constructor(version: string, baseVersion: string, baseFolder: string) {
        super(version, baseVersion, baseFolder);
    }
}
