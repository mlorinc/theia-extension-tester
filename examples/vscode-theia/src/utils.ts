import * as fs from "fs-extra";
import * as path from "path";


export function prepareWorkspace() {
	const root = path.resolve(__dirname, '..');
	// create test dir
	const dir = path.join(root, 'out', 'projects');
	const resources = path.join(root, 'src', 'tests', 'resources');

	// prepare workspace
	fs.removeSync(dir);
	fs.mkdirSync(dir);

	for (const file of fs.readdirSync(resources)) {
		fs.copySync(path.join(resources, file), path.join(dir, file));
	}

	return dir;
}