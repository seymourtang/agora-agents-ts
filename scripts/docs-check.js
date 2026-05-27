#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const docsRoot = path.join(__dirname, "..", "docs");
const errors = [];

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
  const rel = path.relative(path.join(__dirname, ".."), filePath);
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
}

walk(docsRoot);

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log("Docs check passed.");
