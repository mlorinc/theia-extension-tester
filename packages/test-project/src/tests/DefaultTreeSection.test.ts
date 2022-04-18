import { expect } from "chai";
import { IDefaultTreeSection, EditorView, IViewControl, IWorkbench, TextEditor, Workbench } from "@theia-extension-tester/page-objects";
import * as path from "path";
import { deleteFiles, getExplorerSection } from "./utils/File";

describe.skip('DefaultTreeSection', function () {
    this.timeout(60000);
    let workbench: IWorkbench;
    let control: IViewControl;
    let section: IDefaultTreeSection;

    const root = 'quarkus-quickstarts';
    const FILE_TXT = path.join(root, 'file.txt');
    const FILE_ABSOLUTE_TXT = path.join(root, 'file-absolute.txt');
    const FOLDER = path.join(root, 'folder');
    const FOLDER_ABSOLUTE = path.join(root, 'folder-absolute');

    before(async function () {
        workbench = new Workbench();
        control = await workbench.getActivityBar().getViewControl('Explorer') as IViewControl;
        section = await getExplorerSection();
        await cleanFiles();
        await new EditorView().closeAllEditors();
    });

    beforeEach(async function () {
        await section.expand();
    });

    after(async function () {
        await cleanFiles();
        await control.closeView();
        await new EditorView().closeAllEditors();
    });

    async function cleanFiles() {
        await deleteFiles(FILE_TXT, FILE_ABSOLUTE_TXT, FOLDER, FOLDER_ABSOLUTE);
    }

    it('getVisibleItems', async function () {
        this.retries(3);
        const items = await section.getVisibleItems();
        const labels = await Promise.all(items.map((item) => item.getLabel()))
        expect(labels).to.include.members(['quarkus-quickstarts', '.theia']);
        expect(labels).not.to.include(['GreetingMain.java', 'README.md']);
    });

    it('openItem', async function () {
        await section.openItem(
            'quarkus-quickstarts', 'getting-started', 'src',
            'main', 'java', 'org', 'acme', 'getting', 'started', 'GreetingService.java'
        );
        const tab = await new EditorView().getTabByTitle('GreetingService.java');
        expect(tab).not.to.be.undefined;
    });

    it.skip('findItem', async function () {
        const item = await section.findItem('.theia', 10);
        expect(await item?.getLabel()).equals('.theia');
    });

    it('findItemByPath', async function () {
        const item = await section.findItemByPath('quarkus-quickstarts', 'getting-started', '.gitignore');
        expect(await item?.getLabel()).equals('.gitignore');
    });

    for (let i = 1; i <= 2; i++) {
        it(`createFolder - level ${i}`, async function() {
            const folder = path.join(root, ...new Array<string>(i).fill('folder'));
            await section.createFolder(folder);
            expect(await section.existsFolder(folder)).to.be.true;
    
            const folderAbsolute = path.join(root, ...new Array<string>(i).fill('folder-absolute'));
            await section.createFolder(folderAbsolute);
            expect(await section.existsFolder(folderAbsolute)).to.be.true;
        });
    }

    for (let i = 1; i <= 2; i++) {
        it(`createFile - level ${i}`, async function() {
            const file = path.join(root, ...new Array<string>(i-1).fill('folder'), 'file.txt');
            await section.createFile(file);
            expect(await section.existsFile(file)).to.be.true;
    
            const fileAbsolute = path.join(root, ...new Array<string>(i-1).fill('folder-absolute'), 'file-absolute.txt');
            await section.createFile(fileAbsolute);
            expect(await section.existsFile(fileAbsolute)).to.be.true;
        });
    }

    it('existsFolder', async function() {
        expect(await section.existsFolder(FOLDER, this.timeout())).to.be.true;
        expect(await section.existsFolder(path.join(await workbench.getOpenFolderPath(), 'folder', 'folder'))).to.be.true;
        expect(await section.existsFolder('experiment', 3000)).to.be.false;
        expect(await section.existsFolder('experiment', 0)).to.be.false;
        expect(await section.existsFolder(FOLDER, this.timeout())).to.be.true;
        expect(await section.existsFolder(path.join(FOLDER, 'folder'), this.timeout())).to.be.true;
    });

    it('existsFile', async function() {
        expect(await section.existsFile(path.join(FOLDER, 'file.txt'), this.timeout())).to.be.true;
        expect(await section.existsFile(path.join(await workbench.getOpenFolderPath(), 'folder', 'file.txt'))).to.be.true;
        expect(await section.existsFile('experiment', 3000)).to.be.false;
        expect(await section.existsFile('experiment', 0)).to.be.false;
        expect(await section.existsFile(FILE_TXT, this.timeout())).to.be.true;
    });

    it('deleteFile', async function() {
        expect(await section.existsFile(FILE_TXT)).to.be.true;
        await section.deleteFile(FILE_TXT);
        expect(await section.existsFile(FILE_TXT, 0)).to.be.false;

        const file = path.join(await workbench.getOpenFolderPath(), 'folder', 'file.txt');
        expect(await section.existsFile(file)).to.be.true;
        await section.deleteFile(file);
        expect(await section.existsFile(file, 0)).to.be.false;
    });

    it('deleteFolder', async function() {
        expect(await section.existsFolder(FOLDER)).to.be.true;
        await section.deleteFolder(FOLDER);
        expect(await section.existsFolder('folder', 0)).to.be.false;

        const folder = path.join(await workbench.getOpenFolderPath(), 'folder-absolute', 'folder-absolute');
        expect(await section.existsFolder(folder)).to.be.true;
        await section.deleteFolder(folder);
        expect(await section.existsFolder(folder, 0)).to.be.false;
    });

    it('openFile', async function() {
        const file = path.join(FOLDER_ABSOLUTE, 'file-absolute.txt');
        expect(await section.existsFile(file)).to.be.true;
        let editor = await section.openFile(file) as TextEditor;
        expect(await editor.getFilePath()).equals(path.join(await workbench.getOpenFolderPath(), file));

        const rootFile = FILE_ABSOLUTE_TXT;
        expect(await section.existsFile(rootFile)).to.be.true;
        editor = await section.openFile(rootFile) as TextEditor;
        expect(await editor.getFilePath()).equals(path.join(await workbench.getOpenFolderPath(), rootFile));
    });
});
