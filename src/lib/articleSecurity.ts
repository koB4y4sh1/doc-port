import DOMPurify from 'isomorphic-dompurify';

export const ARTICLE_ROOT_CLASS = 'article-root';

const FORBIDDEN_TAGS = ['script', 'iframe', 'form', 'object', 'embed', 'base', 'meta', 'link'];
const FORBIDDEN_ATTR = ['style'];

const ALLOWED_CSS_PROPERTIES = new Set([
  'align-items',
  'backdrop-filter',
  'background',
  'background-color',
  'border',
  'border-bottom',
  'border-collapse',
  'border-left',
  'border-radius',
  'border-top',
  'box-shadow',
  'box-sizing',
  'color',
  'content',
  'display',
  'flex-wrap',
  'font-family',
  'font-size',
  'font-weight',
  'gap',
  'grid-column',
  'grid-template-columns',
  'height',
  'inset',
  'letter-spacing',
  'line-height',
  'margin',
  'margin-bottom',
  'margin-top',
  'max-width',
  'min-width',
  'overflow',
  'overflow-x',
  'padding',
  'padding-left',
  'padding-top',
  'pointer-events',
  'position',
  'text-align',
  'text-decoration',
  'text-transform',
  'vertical-align',
  'width',
]);

type CssRule = {
  kind: 'rule';
  selector: string;
  body: string;
};

type CssMediaRule = {
  kind: 'media';
  prelude: string;
  rules: CssNode[];
};

type CssNode = CssRule | CssMediaRule;

export type ArticleSecurityResult = {
  html: string;
  css: string;
  errors: string[];
};

export const extractStyleBlocksFromHtml = (html: string) => {
  const styles: string[] = [];
  const htmlWithoutStyles = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, css: string) => {
    styles.push(css.trim());
    return '';
  });

  return {
    html: htmlWithoutStyles,
    css: styles.filter(Boolean).join('\n\n'),
  };
};

export const sanitizeArticleHtml = (html: string) => {
  const sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: FORBIDDEN_TAGS,
    FORBID_ATTR: FORBIDDEN_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|\.\/|\.\.\/|#)/i,
  });

  if (typeof DOMParser === 'undefined') {
    return sanitized;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, 'text/html');

  doc.querySelectorAll<HTMLElement>('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      if (/^on/i.test(attribute.name)) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  doc.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href || !isSafeHref(href)) {
      anchor.removeAttribute('href');
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
      return;
    }

    if (isExternalHttpUrl(href)) {
      const relValues = new Set((anchor.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));
      relValues.add('noopener');
      relValues.add('noreferrer');
      anchor.setAttribute('rel', Array.from(relValues).join(' '));
    }
  });

  doc.querySelectorAll<HTMLImageElement>('img[src]').forEach((image) => {
    const src = image.getAttribute('src');
    if (!src || !isSafeSrc(src)) {
      image.removeAttribute('src');
    }
  });

  return doc.body.innerHTML;
};

export const validateAndScopeCss = (cssText: string) => {
  if (!cssText.trim()) {
    return { css: '', errors: [] as string[] };
  }

  const errors: string[] = [];
  const parsedRules = parseCssNodes(stripCssComments(cssText), errors);
  const scopedCss = serializeCssNodes(parsedRules, errors);

  return {
    css: errors.length > 0 ? '' : scopedCss,
    errors,
  };
};

export const secureArticleMarkup = (html: string, cssText: string): ArticleSecurityResult => {
  const sanitizedHtml = sanitizeArticleHtml(html);
  const cssResult = validateAndScopeCss(cssText);

  return {
    html: sanitizedHtml,
    css: cssResult.css,
    errors: cssResult.errors,
  };
};

const isSafeHref = (value: string) => {
  if (/^\s*javascript:/i.test(value) || /^\s*data:/i.test(value)) {
    return false;
  }
  return /^(https?:|mailto:|tel:|\/|\.\/|\.\.\/|#)/i.test(value);
};

const isSafeSrc = (value: string) => {
  if (/^\s*javascript:/i.test(value) || /^\s*data:/i.test(value)) {
    return false;
  }
  return /^(https?:|\/|\.\/|\.\.\/)/i.test(value);
};

const isExternalHttpUrl = (value: string) => /^https?:\/\//i.test(value);
const stripCssComments = (cssText: string) => cssText.replace(/\/\*[\s\S]*?\*\//g, '');

const parseCssNodes = (cssText: string, errors: string[]) => {
  const nodes: CssNode[] = [];
  let index = 0;

  while (index < cssText.length) {
    index = skipWhitespace(cssText, index);
    if (index >= cssText.length) {
      break;
    }

    const blockStart = cssText.indexOf('{', index);
    if (blockStart === -1) {
      const trailing = cssText.slice(index).trim();
      if (trailing) {
        errors.push(`Unparsed CSS tail: ${trailing}`);
      }
      break;
    }

    const header = cssText.slice(index, blockStart).trim();
    const blockEnd = findMatchingBrace(cssText, blockStart);
    if (blockEnd === -1) {
      errors.push(`Unclosed CSS block near: ${header}`);
      break;
    }

    const body = cssText.slice(blockStart + 1, blockEnd);
    if (header.startsWith('@')) {
      if (!/^@media\b/i.test(header)) {
        errors.push(`Disallowed at-rule: ${header}`);
      } else {
        nodes.push({
          kind: 'media',
          prelude: header,
          rules: parseCssNodes(body, errors),
        });
      }
    } else {
      nodes.push({
        kind: 'rule',
        selector: header,
        body,
      });
    }

    index = blockEnd + 1;
  }

  return nodes;
};

const serializeCssNodes = (nodes: CssNode[], errors: string[]): string => {
  return nodes
    .map((node) => {
      if (node.kind === 'media') {
        const nested = serializeCssNodes(node.rules, errors);
        if (!nested.trim()) {
          return '';
        }
        return `${node.prelude} {\n${nested}\n}`;
      }

      const scopedSelector = scopeSelectors(node.selector);
      const declarations = parseDeclarations(node.body);
      const safeDeclarations = declarations
        .map((declaration) => validateDeclaration(scopedSelector, declaration.property, declaration.value, errors))
        .filter((value): value is string => Boolean(value));

      if (safeDeclarations.length === 0) {
        return '';
      }

      return `${scopedSelector} {\n  ${safeDeclarations.join(';\n  ')};\n}`;
    })
    .filter(Boolean)
    .join('\n');
};

const scopeSelectors = (selectorText: string) => {
  return splitTopLevel(selectorText, ',')
    .map((selector) => {
      const trimmed = selector.trim();
      const normalized = trimmed
        .replace(/:root\b/gi, `.${ARTICLE_ROOT_CLASS}`)
        .replace(/\bhtml\b/gi, `.${ARTICLE_ROOT_CLASS}`)
        .replace(/\bbody\b/gi, `.${ARTICLE_ROOT_CLASS}`);

      if (!normalized || normalized === `.${ARTICLE_ROOT_CLASS}`) {
        return `.${ARTICLE_ROOT_CLASS}`;
      }

      if (normalized.startsWith(`.${ARTICLE_ROOT_CLASS}`)) {
        return normalized.replace(
          new RegExp(`\\.${ARTICLE_ROOT_CLASS}\\s+\\.${ARTICLE_ROOT_CLASS}`, 'g'),
          `.${ARTICLE_ROOT_CLASS}`,
        );
      }

      return `.${ARTICLE_ROOT_CLASS} ${normalized}`;
    })
    .join(', ');
};

const parseDeclarations = (body: string) => {
  return splitTopLevel(body, ';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .flatMap((chunk) => {
      const separatorIndex = chunk.indexOf(':');
      if (separatorIndex === -1) {
        return [];
      }

      const property = chunk.slice(0, separatorIndex).trim().toLowerCase();
      const value = chunk.slice(separatorIndex + 1).trim();
      if (!property || !value) {
        return [];
      }

      return [{ property, value }];
    });
};

const validateDeclaration = (selector: string, property: string, value: string, errors: string[]) => {
  if (!property.startsWith('--') && !ALLOWED_CSS_PROPERTIES.has(property)) {
    errors.push(`Disallowed CSS property "${property}" in selector "${selector}"`);
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  if (/url\s*\(/i.test(value)) {
    errors.push(`Disallowed CSS url() in selector "${selector}"`);
    return null;
  }

  if (/expression\s*\(/i.test(value) || /javascript:/i.test(value)) {
    errors.push(`Disallowed CSS value "${value}" in selector "${selector}"`);
    return null;
  }

  if (property === 'display' && normalizedValue === 'none') {
    errors.push(`Disallowed display:none in selector "${selector}"`);
    return null;
  }

  if (property === 'position' && !['relative', 'absolute'].includes(normalizedValue)) {
    errors.push(`Disallowed position value "${value}" in selector "${selector}"`);
    return null;
  }

  if (property === 'pointer-events' && normalizedValue === 'none' && !hasPseudoElement(selector)) {
    errors.push(`pointer-events:none is only allowed on pseudo-elements: "${selector}"`);
    return null;
  }

  if (property === 'content' && !hasPseudoElement(selector)) {
    errors.push(`content is only allowed on pseudo-elements: "${selector}"`);
    return null;
  }

  return `${property}: ${value}`;
};

const hasPseudoElement = (selector: string) => /::(before|after)\b/i.test(selector);

const splitTopLevel = (text: string, delimiter: ',' | ';') => {
  const parts: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let roundDepth = 0;
  let squareDepth = 0;

  for (const char of text) {
    if (quote) {
      current += char;
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === '(') {
      roundDepth += 1;
      current += char;
      continue;
    }

    if (char === ')') {
      roundDepth = Math.max(0, roundDepth - 1);
      current += char;
      continue;
    }

    if (char === '[') {
      squareDepth += 1;
      current += char;
      continue;
    }

    if (char === ']') {
      squareDepth = Math.max(0, squareDepth - 1);
      current += char;
      continue;
    }

    if (char === delimiter && roundDepth === 0 && squareDepth === 0) {
      parts.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current) {
    parts.push(current);
  }

  return parts;
};

const skipWhitespace = (text: string, index: number) => {
  while (index < text.length && /\s/.test(text[index]!)) {
    index += 1;
  }
  return index;
};

const findMatchingBrace = (text: string, openBraceIndex: number) => {
  let depth = 0;
  let quote: '"' | "'" | null = null;

  for (let index = openBraceIndex; index < text.length; index += 1) {
    const char = text[index]!;
    if (quote) {
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
};
