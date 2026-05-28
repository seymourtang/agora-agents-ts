#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const docsRoot = path.join(__dirname, "..", "docs");
const repoRoot = path.join(__dirname, "..");
const readmePath = path.join(repoRoot, "README.md");
const errors = [];
const legacyPackagePatterns = [/\bagora-agent-server-sdk\b/];

function isAllowedLegacyPackageLine(line) {
    return (
        line.includes("compat/") ||
        /\bmigrat(?:e|ing|ion)\b/i.test(line) ||
        /previous package name/i.test(line) ||
        /renamed from/i.test(line)
    );
}

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath);
        } else if (entry.name.endsWith(".md")) {
            checkFile(fullPath);
        }
    }
}

function checkFile(filePath) {
    const rel = path.relative(repoRoot, filePath);
    const text = fs.readFileSync(filePath, "utf8");

    if (/workspace [`']docs\//i.test(text)) {
        errors.push(`${rel}: references workspace-only documentation`);
    }

    if (rel === "docs/getting-started/quick-start.md") {
        if (/\bauthToken\b/.test(text)) {
            errors.push(`${rel}: quick start must use app credentials, not authToken`);
        }
        if (/\bAgentPresets\b/.test(text)) {
            errors.push(`${rel}: quick start must use the builder, not AgentPresets`);
        }
    }

    // Legacy package references are only allowed in compat docs/paths.
    if (!rel.startsWith("compat/")) {
        const lines = text.split("\n");
        for (const pattern of legacyPackagePatterns) {
            for (const line of lines) {
                if (pattern.test(line) && !isAllowedLegacyPackageLine(line)) {
                    errors.push(`${rel}: contains legacy package name reference outside compat context`);
                    return;
                }
            }
        }
    }
}

walk(docsRoot);
checkFile(readmePath);

if (errors.length > 0) {
    for (const error of errors) {
        console.error(error);
    }
    process.exit(1);
}

console.log("Docs check passed.");
