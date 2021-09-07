import { Editor, ISetting, ISettingsEditor } from "../../../module";

export class SettingsEditor extends Editor implements ISettingsEditor {
    findSetting(title: string, ...categories: string[]): Promise<ISetting> {
        throw new Error("Method not implemented.");
    }
    switchToPerspective(perspective: "User" | "Workspace"): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
