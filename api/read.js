import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

async function translateText(text) {
  if (!text || text.trim().length < 3) return text;
  if (/[가-힣]/.test(text) && !/[a-zA-Z]{3,}/.test(text)) return text;

  try {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'en',
      tl: 'ko',
      dt: 't',
      q: text.slice(0, 1500), // Max length per chunk
    });
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
    });
    const data = await res.json();
    return data?.[0] ? data[0].map((s) => s[0]).join('') : text;
  } catch (e) {
    return text;
  }
}

export default async function handler(req, res) {
  const { url, tr } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch original article. Status: ${response.status}`);
    }

    const html = await response.text();
    const doc = new JSDOM(html, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article) {
      return res.status(404).json({ error: 'Could not extract article content' });
    }

    // Process Translation if requested
    if (tr === '1') {
      article.title = await translateText(article.title);

      // Translate HTML content by paragraphs
      const dom = new JSDOM(article.content);
      const paragraphs = dom.window.document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
      
      // We process translations in parallel batches to speed up
      const batchSize = 5;
      for (let i = 0; i < paragraphs.length; i += batchSize) {
        const batch = Array.from(paragraphs).slice(i, i + batchSize);
        await Promise.all(batch.map(async (el) => {
          if (el.textContent && el.textContent.trim().length > 0) {
            const translated = await translateText(el.textContent);
            if (translated && translated !== el.textContent) {
              el.textContent = translated;
            }
          }
        }));
      }
      article.content = dom.window.document.body.innerHTML;
    }

    // 1 hour cache
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(article);
  } catch (error) {
    console.error('Read API Error:', error);
    res.status(500).json({ error: 'Failed to read article' });
  }
}
