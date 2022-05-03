const fs = require("fs-extra");
const path = require("path");

function copy(src, dest) {
    fs.copyFileSync(src, dest);
    console.log(`Copied "${src}" into "${dest}".`);
}

async function main() {
    const license = "LICENSE";
    const packageDirs = fs.readdirSync("packages", {
        encoding: "utf8"
    });
    const packages = packageDirs.map(x => path.join("packages", x));
    packages.forEach((package) => copy(license, path.join(package, license)));
}

main();