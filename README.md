<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# DocPort

DocPort is a React/Vite documentation portal protected by Supabase Auth.

## Run Locally

**Prerequisites:** Node.js, a Supabase project

1. Install dependencies:
   `pnpm install`
2. Set the Supabase credentials in `.env.local`:
   - `VITE_SUPABASE_URL=https://your-project.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key`
3. In the Supabase dashboard, add local development URLs:
   - `http://localhost:3000`
   - `http://localhost:3000/sign-in`
   - `http://localhost:3000/sign-up`
4. Run the app:
   `pnpm dev`

## Authentication

- All routes are protected. Unauthenticated users are redirected to `/sign-in`.
- Custom Supabase sign-in and sign-up pages are mounted at `/sign-in` and `/sign-up`.
- Signed-in users can open `/account` from the sidebar account menu to manage profile and password.

## Recommended Supabase Auth settings

- If this portal is internal, disable open self-sign-up and use invitations only.
- If you enable OAuth providers, restrict redirect URLs and allowed email domains.
- Decide whether email confirmation is required before enabling public sign-up.

## Article Security Rules

Files under `src/articles/*.html` are treated as untrusted input.

- HTML is sanitized before rendering.
- `<style>` is extracted and validated separately.
- Only validated CSS is injected.
- Articles with unsafe HTML/CSS are blocked in validation and at runtime.

### HTML rules

- Dangerous tags such as `script`, `iframe`, `form`, `object`, and `embed` are blocked.
- Inline event handler attributes such as `onclick` are blocked.
- `javascript:` URLs are blocked.
- Inline `style=""` attributes are blocked.

### CSS rules

- CSS is scoped to `.article-root`.
- `@media` is allowed.
- `@import` and unsupported at-rules are blocked.
- `position: fixed`, `z-index`, `display: none`, `animation`, and `transition` are blocked.
- `pointer-events: none` and `content` are only allowed on pseudo-elements.

### Validation commands

- `pnpm lint`
- `pnpm test`
- `pnpm validate:articles`
- `pnpm check`

## AI Prompt Templates for HTML Generation

Use the following prompts when asking an AI to create article HTML for `src/articles`.

### Template Prompt

```text
Create a single HTML article file for this project.

Requirements:
- Output only HTML.
- Save target: src/articles/[slug].html
- Include the following metadata in the head:
  <head>
    <meta name="keywords" content="keyword1, keyword2, keyword3">
    <meta name="date" content="YYYY-MM-DD">
  </head>
- The first <h1> is used as the article title.
- The first <p> is used as the article summary.
- Use clear structure with <h2> and <h3>.
- Do not include JavaScript.
- You may include a <style> tag if the article needs custom styling.
- Keep the article self-contained and readable in a documentation site.
- Write the article in Japanese.

Topic:
[topic]

Audience:
[target audience]

Keywords:
[keyword1, keyword2, keyword3]

Date:
[YYYY-MM-DD]
```

### Layout Prompt

```text
Design the HTML with a polished long-form article layout.

Layout requirements:
- Create a strong hero section near the top.
- Use a clean content width suitable for reading.
- Add section spacing that clearly separates topics.
- Use cards, callouts, comparison tables, checklists, or highlight boxes where helpful.
- Make the design responsive for desktop and mobile.
- Prefer a modern editorial look over a plain blog layout.
- Use tasteful colors and typography.
- Keep accessibility in mind: strong contrast, semantic headings, readable font sizes.
- Avoid JavaScript and external dependencies.
- If using CSS, include it in a <style> tag inside the HTML file.
```

### Recommended Combined Prompt

```text
Create a complete HTML article for src/articles/[slug].html.

Output only HTML.
Write in Japanese.
Use this metadata:
<head>
  <meta name="keywords" content="[keyword1, keyword2, keyword3]">
  <meta name="date" content="[YYYY-MM-DD]">
</head>

Content rules:
- Start with one <h1>.
- Follow with one summary paragraph.
- Organize the article with <h2> and <h3>.
- Include practical examples where useful.
- No JavaScript.

Design rules:
- Build a polished long-form article layout.
- Add a hero section and well-spaced content sections.
- Use responsive CSS in a <style> tag if needed.
- Make it visually strong but still readable.
- Use semantic HTML and accessible color contrast.

Topic:
[topic]
```
