#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");

async function removeIfExists(targetPath) {
    try {
        await fs.rm(targetPath, { recursive: true, force: true });
        console.log(`Removed ${targetPath}`);
    } catch (error) {
        console.error(`Failed to remove ${targetPath}:`, error.message);
        process.exit(1);
    }
}

async function main() {
    const root = process.cwd();
    await removeIfExists(path.join(root, "dist", "cjs"));
    await removeIfExists(path.join(root, "dist", "esm"));
}

main();
