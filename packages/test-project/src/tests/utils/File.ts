import { DefaultTreeSection, IDefaultTreeSection, Workbench } from "@theia-extension-tester/page-objects";
import * as path from "path";

export async function getExplorerSection(): Promise<IDefaultTreeSection> {
    const control = await new Workbench().getActivityBar().getViewControl('Explorer');
    const sideBar = await control!.openView();

    for (const section of await sideBar.getContent().getSections()) {
        const title = (await section.getTitle()).toLowerCase();
        if (section instanceof DefaultTreeSection && (title.includes('workspace') || title.includes('projects'))) {
            return section;
        }
    }

    throw new Error('Could not find file section.');
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

export function getProjectPath(): string {
    const project = process.env['THEIA_EXPECTED_WORKBENCH_PATH'];

    if (project) {
        return project;
    }

    throw new Error('THEIA_EXPECTED_WORKBENCH_PATH is undefined');
}