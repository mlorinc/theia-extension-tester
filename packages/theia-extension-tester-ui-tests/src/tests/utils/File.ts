import { IDefaultTreeSection, Workbench } from "@theia-extension-tester/page-objects";
import * as path from "path";

export async function getExplorerSection(): Promise<IDefaultTreeSection> {
    const control = await new Workbench().getActivityBar().getViewControl('Explorer');
    const sideBar = await control!.openView();
    return (await sideBar.getContent().getSections())[0] as IDefaultTreeSection;
}

export async function deleteFiles(...files: string[]) {
    const tree = await getExplorerSection();

    for (const file of files) {
        if (path.extname(file).length > 0) {
            if (await tree.existsFile(file, 0)) {
                await tree.deleteFile(file).catch((e) => {
                    console.error(e);
                });
            }
        }
        else {
            if (await tree.existsFolder(file, 0)) {
                await tree.deleteFolder(file).catch((e) => {
                    console.error(e);
                });
            }
        }
    }
}
