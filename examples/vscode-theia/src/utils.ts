import * as fs from "fs-extra";
import * as path from "path";


export function prepareWorkspace() {
	const root = path.resolve(__dirname, '..');
	// create test dir
	const dir = path.join(root, 'out', 'projects');
	const resources = path.join(root, 'src', 'tests', 'resources', 'projects');

	// prepare workspace
	fs.removeSync(dir);
	fs.mkdirSync(dir);
	fs.copySync(resources, dir);
	return dir;
}

if (require.main === module) {
	prepareWorkspace();
}