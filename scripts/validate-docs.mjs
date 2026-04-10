import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const bannedPatterns = [
  /\{\{\s*owner\s*\}\}/,
  /\{\{\s*repo\s*\}\}/,
  /from agora-agent-server-sdk/,
];
// `concepts` and `reference` snippets must declare whether they are runnable examples or API fragments.
const codeBlockRegex = /(?:(<!--\s*snippet:\s*(executable|fragment)\s*-->)[ \t]*\n)?```(typescript|ts)\n([\s\S]*?)```/g;
const markdownFiles = collectMarkdownFiles();

function walk(dir, files) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'coverage') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(full);
    }
  }
}

let snippetCount = 0;
let fragmentCount = 0;
const failures = [];

function collectMarkdownFiles() {
  const files = [path.join(root, 'README.md')];
  walk(path.join(root, 'docs'), files);
  return files.sort();
}

function isAnnotatedSection(file) {
  const normalized = file.split(path.sep).join('/');
  return normalized.includes('/docs/concepts/') || normalized.includes('/docs/reference/');
}

function snippetModeFor(file, code, annotation) {
  if (annotation === 'fragment') {
    return 'fragment';
  }
  if (annotation === 'executable') {
    return 'executable';
  }
  return shouldValidate(code) ? 'executable' : 'fragment';
}

function validateSnippet(fileName, code) {
  const candidates = [code, `async function _snippet(): Promise<void> {\n${code}\n}\n`];
  const importAwareCandidate = buildImportAwareCandidate(code);
  if (importAwareCandidate) {
    candidates.push(importAwareCandidate);
  }

  for (const candidate of candidates) {
    const transpiled = ts.transpileModule(candidate, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        strict: false,
      },
      fileName,
      reportDiagnostics: true,
    });

    const errors = (transpiled.diagnostics ?? []).filter(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
    );
    if (errors.length === 0) {
      return [];
    }
  }

  const fallback = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      strict: false,
    },
    fileName,
    reportDiagnostics: true,
  });

  return (fallback.diagnostics ?? [])
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
}

function shouldValidate(code) {
  return /\bimport\b/.test(code) && !code.includes('...');
}

function buildImportAwareCandidate(code) {
  const lines = code.split('\n');
  const importLines = [];
  const bodyLines = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed.length === 0) continue;
    if (trimmed.startsWith('import ')) {
      importLines.push(rawLine);
      continue;
    }
    bodyLines.push(rawLine);
  }

  if (importLines.length === 0) {
    return undefined;
  }

  return `${importLines.join('\n')}\n\nasync function _snippet(): Promise<void> {\n${bodyLines.join('\n')}\n}\n`;
}

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, 'utf8');

  for (const pattern of bannedPatterns) {
    if (pattern.test(content)) {
      failures.push(`${path.relative(root, file)} contains banned pattern: ${pattern}`);
    }
  }

  for (const match of content.matchAll(codeBlockRegex)) {
    const annotation = match[2];
    const language = match[3];
    const code = match[4];

    if (isAnnotatedSection(file) && !annotation) {
      failures.push(`${path.relative(root, file)} contains an unannotated ${language} snippet`);
      continue;
    }

    const mode = snippetModeFor(file, code, annotation);
    if (mode === 'fragment') {
      fragmentCount += 1;
      continue;
    }

    snippetCount += 1;
    for (const message of validateSnippet(`${path.basename(file)}.${language}`, code)) {
      failures.push(`${path.relative(root, file)}: ${message}`);
    }
  }
}

if (snippetCount === 0) {
  failures.push('No TypeScript code blocks found in README/docs markdown.');
}

if (failures.length > 0) {
  console.error('Documentation validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Validated ${snippetCount} executable and ${fragmentCount} fragment TypeScript snippets across ${markdownFiles.length} markdown files.`,
);
