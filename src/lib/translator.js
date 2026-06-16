import { CONFIG } from './config';
import { hashStr } from './utils';

// ===== In-memory + localStorage cache =====
let cache = {};

export function loadTranslationCache() {
  try {
    const stored = localStorage.getItem(CONFIG.translationCacheKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      // Evict expired entries
      Object.keys(parsed).forEach((key) => {
        if (now - parsed[key].t > CONFIG.translationCacheTTL) {
          delete parsed[key];
        }
      });
      cache = parsed;
    }
  } catch {
    cache = {};
  }
}

function saveCache() {
  try {
    localStorage.setItem(CONFIG.translationCacheKey, JSON.stringify(cache));
  } catch {
    // storage full — clear
    cache = {};
  }
}

function getCached(text) {
  const key = hashStr(text);
  const entry = cache[key];
  if (entry && Date.now() - entry.t < CONFIG.translationCacheTTL) {
    return entry.v;
  }
  return null;
}

function setCached(original, translated) {
  cache[hashStr(original)] = { v: translated, t: Date.now() };
}

/**
 * Translate a single string from English to Korean.
 */
async function translateText(text) {
  if (!text || text.length < 3) return text;
  // Skip if already mostly Korean
  if (/[가-힣]/.test(text) && !/[a-zA-Z]{3,}/.test(text)) return text;

  try {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'en',
      tl: 'ko',
      dt: 't',
      q: text.slice(0, 500),
    });

    const response = await fetch(`${CONFIG.translateApiUrl}?${params}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return text;
    const data = await response.json();
    return data?.[0] ? data[0].map((s) => s[0]).join('') : text;
  } catch {
    return text;
  }
}

/**
 * Translate all US articles' titles and descriptions.
 * Returns a new array with translated articles.
 */
export async function translateArticles(articles) {
  const result = articles.map((a) => ({ ...a }));

  for (const article of result) {
    if (article.category !== 'us') continue;

    // Check cache
    const cachedTitle = getCached(article.title);
    if (cachedTitle) {
      article.originalTitle = article.title;
      article.title = cachedTitle;
      article.translated = true;

      if (article.description) {
        const cachedDesc = getCached(article.description);
        if (cachedDesc) {
          article.originalDesc = article.description;
          article.description = cachedDesc;
        }
      }
      continue;
    }

    try {
      const translatedTitle = await translateText(article.title);
      if (translatedTitle && translatedTitle !== article.title) {
        article.originalTitle = article.title;
        article.title = translatedTitle;
        article.translated = true;
        setCached(article.originalTitle, translatedTitle);
      }

      if (article.description) {
        const translatedDesc = await translateText(article.description);
        if (translatedDesc && translatedDesc !== article.description) {
          article.originalDesc = article.description;
          article.description = translatedDesc;
          setCached(article.originalDesc, translatedDesc);
        }
      }

      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 80));
    } catch {
      // skip this article
    }
  }

  saveCache();
  return result;
}
