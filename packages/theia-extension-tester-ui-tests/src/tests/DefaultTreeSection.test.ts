import { expect } from "chai";
import { DefaultTreeSection, EditorView, ISideBarView, IViewContent, IViewControl, IWorkbench, TextEditor, Workbench } from "@theia-extension-tester/page-objects";
import * as path from "path";
import { deleteFiles } from "./utils/File";

describe('DefaultTreeSection', function () {
    this.timeout(60000);
    let workbench: IWorkbench;
    let view: ISideBarView;
    let content: IViewContent;
    let control: IViewControl;
    let section: DefaultTreeSection;

    before(async function () {
        workbench = new Workbench();
        control = await workbench.getActivityBar().getViewControl('Explorer');
        view = await control.openView();
        content = view.getContent();
        section = (await content.getSections())[0] as DefaultTreeSection;
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
        await deleteFiles('file.txt', 'file-absolute.txt', 'folder', 'folder-absolute');
    }

    it.skip('getVisibleItems', async function () {
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

    for (let i = 1; i <= 2; i++) {
        it(`createFolder - level ${i}`, async function() {
            const folder = path.join(...new Array<string>(i).fill('folder'));
            await section.createFolder(folder);
            expect(await section.existsFolder(folder)).to.be.true;
    
            const folderAbsolute = path.join(...new Array<string>(i).fill('folder-absolute'));
            await section.createFolder(folderAbsolute);
            expect(await section.existsFolder(folderAbsolute)).to.be.true;
        });
    }

    for (let i = 1; i <= 2; i++) {
        it(`createFile - level ${i}`, async function() {
            const file = path.join(...new Array<string>(i-1).fill('folder'), 'file.txt');
            await section.createFile(file);
            expect(await section.existsFile(file)).to.be.true;
    
            const fileAbsolute = path.join(...new Array<string>(i-1).fill('folder-absolute'), 'file-absolute.txt');
            await section.createFile(fileAbsolute);
            expect(await section.existsFile(fileAbsolute)).to.be.true;
        });
    }

    it('existsFolder', async function() {
        expect(await section.existsFolder('folder', this.timeout())).to.be.true;
        expect(await section.existsFolder(path.join(await workbench.getOpenFolderPath(), 'folder', 'folder'))).to.be.true;
        expect(await section.existsFolder('experiment', 3000)).to.be.false;
        expect(await section.existsFolder('experiment', 0)).to.be.false;
        expect(await section.existsFolder('folder', this.timeout())).to.be.true;
        expect(await section.existsFolder('folder/folder', this.timeout())).to.be.true;
    });

    it('existsFile', async function() {
        expect(await section.existsFile('folder/file.txt', this.timeout())).to.be.true;
        expect(await section.existsFile(path.join(await workbench.getOpenFolderPath(), 'folder', 'file.txt'))).to.be.true;
        expect(await section.existsFile('experiment', 3000)).to.be.false;
        expect(await section.existsFile('experiment', 0)).to.be.false;
        expect(await section.existsFile('file.txt', this.timeout())).to.be.true;
        expect(await section.existsFile('folder/file.txt', this.timeout())).to.be.true;
    });

    it('deleteFile', async function() {
        expect(await section.existsFile('file.txt')).to.be.true;
        await section.deleteFile('file.txt');
        expect(await section.existsFile('file.txt', 0)).to.be.false;

        const file = path.join(await workbench.getOpenFolderPath(), 'folder', 'file.txt');
        expect(await section.existsFile(file)).to.be.true;
        await section.deleteFile(file);
        expect(await section.existsFile(file, 0)).to.be.false;
    });

    it('deleteFolder', async function() {
        expect(await section.existsFolder('folder')).to.be.true;
        await section.deleteFolder('folder');
        expect(await section.existsFolder('folder', 0)).to.be.false;

        const folder = path.join(await workbench.getOpenFolderPath(), 'folder-absolute', 'folder-absolute');
        expect(await section.existsFolder(folder)).to.be.true;
        await section.deleteFolder(folder);
        expect(await section.existsFolder(folder, 0)).to.be.false;
    });

    it('openFile', async function() {
        const file = 'folder-absolute/file-absolute.txt';
        expect(await section.existsFile(file)).to.be.true;
        let editor = await section.openFile(file) as TextEditor;
        expect(await editor.getFilePath()).equals(path.join(await workbench.getOpenFolderPath(), file));

        const rootFile = 'file-absolute.txt';
        expect(await section.existsFile(rootFile)).to.be.true;
        editor = await section.openFile(rootFile) as TextEditor;
        expect(await editor.getFilePath()).equals(path.join(await workbench.getOpenFolderPath(), rootFile));
    });
});
