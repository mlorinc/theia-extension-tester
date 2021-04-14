import { LocatorLoader, TheiaLocators } from "./module";

export class TheiaLocatorLoader extends LocatorLoader<TheiaLocators> {
    protected parseVersion(version: string): string {
        return version;
    }

    constructor(version: string, baseVersion: string, baseFolder: string) {
        super(version, baseVersion, baseFolder);
    }
}
