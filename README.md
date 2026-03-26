<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bf161221-adc3-4b4f-921f-3f4b05284d26

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## AI Prompt Templates for HTML Generation

Use the following prompts when asking an AI to create article HTML for `src/pages`.

### Template Prompt

```text
Create a single HTML article file for this project.

Requirements:
- Output only HTML.
- Save target: src/pages/[slug].html
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
Create a complete HTML article for src/pages/[slug].html.

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
