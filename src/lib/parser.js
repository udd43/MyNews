import { cleanText, extractDescription, extractDomain, getTextContent } from './utils';

/**
 * Parse XML text into an array of article objects.
 */
export function parseArticles(xmlText, category, feedType) {
  const parser = new DOMParser();
  let doc = parser.parseFromString(xmlText, 'text/xml');

  if (doc.querySelector('parsererror')) {
    // Fallback: try parsing as HTML (some proxies wrap in <pre>)
    const htmlDoc = parser.parseFromString(xmlText, 'text/html');
    const pre = htmlDoc.querySelector('pre');
    if (pre) {
      doc = parser.parseFromString(pre.textContent, 'text/xml');
      if (doc.querySelector('parsererror')) return [];
    } else {
      return [];
    }
  }

  return extractFromDoc(doc, category, feedType);
}

function extractFromDoc(doc, category, feedType) {
  const articles = [];

  if (feedType === 'atom') {
    doc.querySelectorAll('entry').forEach((entry) => {
      const title = getTextContent(entry, 'title');
      if (!title) return;

      const link =
        entry.querySelector('link[rel="alternate"]')?.getAttribute('href') ||
        entry.querySelector('link')?.getAttribute('href') ||
        '';

      articles.push({
        category,
        title: cleanText(title),
        description: extractDescription(
          getTextContent(entry, 'content') || getTextContent(entry, 'summary')
        ),
        link,
        date: getTextContent(entry, 'published') || getTextContent(entry, 'updated'),
        source: extractDomain(link),
        translated: false,
        originalTitle: null,
        originalDesc: null,
      });
    });
  } else {
    doc.querySelectorAll('item').forEach((item) => {
      const title = getTextContent(item, 'title');
      if (!title) return;

      const link = getTextContent(item, 'link');
      const sourceText =
        item.querySelector('source')?.textContent?.trim() || extractDomain(link);

      articles.push({
        category,
        title: cleanText(title),
        description: extractDescription(getTextContent(item, 'description')),
        link,
        date: getTextContent(item, 'pubDate'),
        source: sourceText,
        translated: false,
        originalTitle: null,
        originalDesc: null,
      });
    });
  }

  return articles;
}
