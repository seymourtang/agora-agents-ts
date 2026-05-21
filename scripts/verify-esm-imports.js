#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");

const relativeJsSpecifierPattern =
    /(?:from\s*['"]|import\s*['"]|import\s*\(\s*['"])(\.{1,2}\/[^'"]+\.js)(?:['"])/g;

async function findFiles(rootPath) {
    const files = [];

    async function scan(directory) {
        const entries = await fs.readdir(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                if (entry.name !== "node_modules" && !entry.name.startsWith(".")) {
                    await scan(fullPath);
                }
            } else if (entry.isFile() && (entry.name.endsWith(".mjs") || entry.name.endsWith(".d.mts"))) {
                files.push(fullPath);
            }
        }
    }

    await scan(rootPath);
    return files;
}

async function main() {
    const targetDir = process.argv[2];
    if (!targetDir) {
        console.error("Please provide a target directory");
        process.exit(1);
    }

    const files = await findFiles(path.resolve(targetDir));
    const failures = [];

    for (const file of files) {
        const content = await fs.readFile(file, "utf8");
        const matches = [...content.matchAll(relativeJsSpecifierPattern)];

        for (const match of matches) {
            failures.push(`${path.relative(process.cwd(), file)}: ${match[1]}`);
        }
    }

    if (failures.length > 0) {
        console.error("ESM output contains relative .js imports:");
        for (const failure of failures) {
            console.error(`  ${failure}`);
        }
        process.exit(1);
    }

    console.log(`Verified ${files.length} ESM files.`);
}

main().catch((error) => {
    console.error("An error occurred:", error.message);
    process.exit(1);
});
