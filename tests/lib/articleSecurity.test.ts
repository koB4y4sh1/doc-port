import { describe, expect, it } from 'vitest';
import { ARTICLE_ROOT_CLASS, sanitizeArticleHtml, validateAndScopeCss } from '@/lib/articleSecurity.ts';

describe('sanitizeArticleHtml', () => {
  it('removes dangerous tags, inline handlers, and javascript urls', () => {
    const sanitized = sanitizeArticleHtml(`
      <div onclick="alert(1)">
        <script>alert(1)</script>
        <a href="javascript:alert(1)" target="_blank">bad</a>
        <a href="https://example.com" target="_blank">good</a>
      </div>
    `);

    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('onclick=');
    expect(sanitized).not.toContain('javascript:');
  });
});

describe('validateAndScopeCss', () => {
  it('scopes safe CSS to the article root', () => {
    const result = validateAndScopeCss(`
      body { color: #fff; }
      .card::before { content: ""; position: absolute; pointer-events: none; }
      @media (max-width: 800px) {
        .card { padding: 16px; }
      }
    `);

    expect(result.errors).toEqual([]);
    expect(result.css).toContain(`.${ARTICLE_ROOT_CLASS} {`);
    expect(result.css).toContain(`.${ARTICLE_ROOT_CLASS} .card::before`);
    expect(result.css).toContain('@media (max-width: 800px)');
  });

  it('rejects blocked CSS behaviors', () => {
    const result = validateAndScopeCss(`
      .banner {
        position: fixed;
        z-index: 10;
        display: none;
      }
    `);

    expect(result.errors).toContainEqual(expect.stringContaining('position value'));
    expect(result.errors).toContainEqual(expect.stringContaining('property "z-index"'));
    expect(result.errors).toContainEqual(expect.stringContaining('display:none'));
  });
});

