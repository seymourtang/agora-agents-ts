#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");

const TARGET_EXT = ".mjs";
const JS_EXT = ".js";

async function findMjsFiles(rootPath) {
    const files = [];

    async function scan(directory) {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                if (entry.name !== "node_modules" && !entry.name.startsWith(".")) {
                    await scan(fullPath);
                }
            } else if (entry.isFile() && entry.name.endsWith(TARGET_EXT)) {
                files.push(fullPath);
            }
        }
    }

    await scan(rootPath);
    return files;
}

function collectRelativeJsSpecifiers(content) {
    const specifiers = [];

    // import ... from "...", export ... from "...", import("...")
    const pattern =
        /(import[\s\S]*?from\s+['"](\.\.?\/[^'"]+\.js)['"])|(export[\s\S]*?from\s+['"](\.\.?\/[^'"]+\.js)['"])|((?:yield\s+import|await\s+import|import)\s*\(\s*['"](\.\.?\/[^'"]+\.js)['"]\s*\))/g;

    let match;
    while ((match = pattern.exec(content)) !== null) {
        const specifier = match[2] || match[4] || match[6];
        if (specifier) {
            specifiers.push(specifier);
        }
    }

    return specifiers;
}

async function pathExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function verify(rootPath) {
    const files = await findMjsFiles(rootPath);
    const mismatches = [];

    for (const file of files) {
        const content = await fs.readFile(file, "utf8");
        const jsSpecifiers = collectRelativeJsSpecifiers(content);

        for (const specifier of jsSpecifiers) {
            const jsTarget = path.resolve(path.dirname(file), specifier);
            const mjsTarget = jsTarget.slice(0, -JS_EXT.length) + TARGET_EXT;

            const [hasJsTarget, hasMjsTarget] = await Promise.all([pathExists(jsTarget), pathExists(mjsTarget)]);
            if (!hasJsTarget && hasMjsTarget) {
                mismatches.push({
                    file: path.relative(process.cwd(), file),
                    specifier,
                    suggested: `${specifier.slice(0, -JS_EXT.length)}${TARGET_EXT}`,
                });
            }
        }
    }

    if (mismatches.length > 0) {
        console.error("Found broken ESM relative .js specifiers that should target .mjs:");
        for (const mismatch of mismatches) {
            console.error(`- ${mismatch.file}: "${mismatch.specifier}" -> "${mismatch.suggested}"`);
        }
        process.exit(1);
    }

    console.log(`Verified ${files.length} ESM files. No broken relative .js specifiers detected.`);
}

async function main() {
    const targetDir = process.argv[2];
    if (!targetDir) {
        console.error("Please provide a target directory");
        process.exit(1);
    }

    const targetPath = path.resolve(targetDir);
    const targetStats = await fs.stat(targetPath).catch(() => null);
    if (!targetStats || !targetStats.isDirectory()) {
        console.error("The provided path is not a directory");
        process.exit(1);
    }

    await verify(targetPath);
}

main().catch((error) => {
    console.error("An error occurred:", error.message);
    process.exit(1);
});
