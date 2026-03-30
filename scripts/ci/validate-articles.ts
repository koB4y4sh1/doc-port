import { HtmlValidate } from 'html-validate';
import fs from 'node:fs/promises';
import path from 'node:path';
import { extractStyleBlocksFromHtml, validateAndScopeCss } from '@/lib/articleSecurity.ts';

const rootDir = process.cwd();
const pagesDir = path.join(rootDir, 'src', 'pages');

const configPath = path.join(rootDir, 'scripts', 'ci', 'htmlvalidate.json');
const htmlValidateConfig = JSON.parse(await fs.readFile(configPath, 'utf8'));
const validator = new HtmlValidate(htmlValidateConfig);

const files = (await fs.readdir(pagesDir))
  .filter((entry) => entry.endsWith('.html'))
  .map((entry) => path.join(pagesDir, entry));

const errors: string[] = [];

for (const filePath of files) {
  const source = await fs.readFile(filePath, 'utf8');
  const relativePath = path.relative(rootDir, filePath);
  const validation = await validator.validateString(source, relativePath);

  for (const result of validation.results) {
    for (const message of result.messages) {
      if (message.severity === 2) {
        errors.push(`${relativePath}:${message.line}:${message.column} ${message.message}`);
      }
    }
  }

  if (/\son[a-z0-9_-]+\s*=/i.test(source)) {
    errors.push(`${relativePath}: inline event handler attributes are not allowed`);
  }

  if (/(href|src)\s*=\s*['"]\s*javascript:/i.test(source)) {
    errors.push(`${relativePath}: javascript: URLs are not allowed`);
  }

  const { css } = extractStyleBlocksFromHtml(source);
  const cssResult = validateAndScopeCss(css);
  cssResult.errors.forEach((error) => {
    errors.push(`${relativePath}: ${error}`);
  });
}

if (errors.length > 0) {
  console.error('Article validation failed:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Article validation passed for ${files.length} files.`);


