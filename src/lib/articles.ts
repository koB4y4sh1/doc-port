import {sanitizeArticleHtml, validateAndScopeCss} from './articleSecurity';

const rawArticles = (import.meta as any).glob('../articles/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  date: string;
  tags: string[];
  styles: string;
  blocked: boolean;
  validationErrors: string[];
}

const parseArticles = (): Article[] =>
  Object.entries(rawArticles).map(([path, content], index) => {
    const slug = path.split('/').pop()?.replace('.html', '') || `article-${index}`;
    const parser = new DOMParser();
    const doc = parser.parseFromString(content as string, 'text/html');
    const styleTags = doc.querySelectorAll('style');
    let styles = '';

    styleTags.forEach((tag) => {
      styles += `${tag.textContent ?? ''}\n`;
      tag.remove();
    });

    const title = doc.title || doc.querySelector('h1')?.textContent || slug;
    const summary = doc.querySelector('p')?.textContent || '';
    const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content');
    const metaDate = doc.querySelector('meta[name="date"]')?.getAttribute('content');
    const divMetadata = doc.querySelector('.article-metadata');
    const tags =
      (metaKeywords || divMetadata?.getAttribute('data-tags'))
        ?.split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== '') || [];

    if (divMetadata) {
      divMetadata.remove();
    }

    const cssResult = validateAndScopeCss(styles);

    return {
      id: String(index + 1),
      title,
      slug,
      content: sanitizeArticleHtml(doc.body.innerHTML),
      summary,
      date: metaDate || divMetadata?.getAttribute('data-date') || '2026-03-25',
      tags,
      styles: cssResult.css,
      blocked: cssResult.errors.length > 0,
      validationErrors: cssResult.errors,
    };
  });

export const articles = parseArticles();
export const publishedArticles = articles.filter((article) => !article.blocked);
