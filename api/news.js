import { XMLParser } from 'fast-xml-parser';

// 서버에서 직접 페칭하므로 프록시 불필요
const FEEDS = {
  dev: {
    url: 'https://news.hada.io/rss/news',
    type: 'atom',
    translate: false,
  },
  us: {
    url: 'https://www.theguardian.com/us-news/rss',
    type: 'rss',
    translate: true,
  },
  kr: {
    url: 'https://news.google.com/rss/search?q=%ED%95%9C%EA%B5%AD+%EC%A0%95%EC%B9%98+OR+%EC%82%AC%EA%B1%B4%EC%82%AC%EA%B3%A0+OR+%ED%95%AB%EB%89%B4%EC%8A%A4&hl=ko&gl=KR&ceid=KR:ko',
    type: 'rss',
    translate: false,
  },
  movie_kr: {
    url: 'https://news.google.com/rss/search?q=%ED%95%9C%EA%B5%AD%EC%98%81%ED%99%94+OR+%EA%B5%AD%EB%82%B4%EC%98%81%ED%99%94+OR+%EA%B7%B9%EC%9E%A5%EA%B0%80&hl=ko&gl=KR&ceid=KR:ko',
    type: 'rss',
    translate: false,
    categoryId: 'movie',
  },
  movie_us: {
    url: 'https://variety.com/v/film/feed/',
    type: 'rss',
    translate: true,
    categoryId: 'movie',
  },
  game: {
    url: 'https://news.google.com/rss/search?q=(PC%EA%B2%8C%EC%9E%84+OR+%EC%BD%98%EC%86%94%EA%B2%8C%EC%9E%84+OR+%EC%8A%A4%ED%8C%80+OR+%EB%B0%B8%EB%B8%8C+OR+%EB%A3%A8%EB%A6%AC%EC%9B%B9)&hl=ko&gl=KR&ceid=KR:ko',
    type: 'rss',
    translate: false,
  },
};

const MAX_ARTICLES = 30;

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDomain(urlStr) {
  try {
    return new URL(urlStr).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function extractImageUrl(item, descriptionHtml) {
  if (item['media:content'] && item['media:content']['@_url']) {
    return item['media:content']['@_url'];
  }
  if (item['media:thumbnail'] && item['media:thumbnail']['@_url']) {
    return item['media:thumbnail']['@_url'];
  }
  
  if (item.enclosure) {
    const encs = Array.isArray(item.enclosure) ? item.enclosure : [item.enclosure];
    for (const enc of encs) {
      if (enc['@_type'] && enc['@_type'].startsWith('image/') && enc['@_url']) {
        return enc['@_url'];
      }
    }
  }
  
  if (descriptionHtml) {
    const match = descriptionHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

async function translateText(text) {
  if (!text || text.length < 3) return text;
  if (/[가-힣]/.test(text) && !/[a-zA-Z]{3,}/.test(text)) return text;

  try {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'en',
      tl: 'ko',
      dt: 't',
      q: text.slice(0, 500),
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

async function processFeed(category, feedConfig) {
  try {
    const response = await fetch(feedConfig.url, {
      headers: { 'User-Agent': 'Vercel API Bot' },
    });
    const xmlData = await response.text();

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xmlData);
    let items = [];

    if (feedConfig.type === 'atom') {
      const entries = parsed.feed?.entry || [];
      items = Array.isArray(entries) ? entries : [entries];
    } else {
      const channelItems = parsed.rss?.channel?.item || [];
      items = Array.isArray(channelItems) ? channelItems : [channelItems];
    }

    items = items.slice(0, MAX_ARTICLES);

    const articles = items.map((item) => {
      let title = '', link = '', description = '', date = '', source = '';

      if (feedConfig.type === 'atom') {
        title = item.title?.['#text'] || item.title || '';
        link = item.link?.['@_href'] || '';
        description = item.content?.['#text'] || item.summary?.['#text'] || '';
        date = item.published || item.updated || '';
        source = extractDomain(link);
      } else {
        title = item.title || '';
        link = item.link || '';
        description = item.description || item['content:encoded'] || '';
        date = item.pubDate || '';
        source = item.source?.['#text'] || extractDomain(link);
      }

      const imageUrl = extractImageUrl(item, description);
      const cleanDesc = cleanText(description);

      return {
        category: feedConfig.categoryId || category,
        title: cleanText(title),
        description: cleanDesc.length > 200 ? cleanDesc.slice(0, 200) + '…' : cleanDesc,
        link,
        date,
        source,
        imageUrl,
        translated: false,
      };
    }).filter(a => a.title);

    // Translate if needed
    if (feedConfig.translate) {
      for (const article of articles) {
        const translatedTitle = await translateText(article.title);
        if (translatedTitle !== article.title) {
          article.originalTitle = article.title;
          article.title = translatedTitle;
          article.translated = true;
        }

        if (article.description) {
          const translatedDesc = await translateText(article.description);
          if (translatedDesc !== article.description) {
            article.originalDesc = article.description;
            article.description = translatedDesc;
          }
        }
      }
    }

    for (const article of articles) {
      const isBreakingTitle = /\[속보\]|\[긴급\]|속보:|긴급:|breaking news|urgent/i.test(article.title) || 
                              /\[속보\]|\[긴급\]|속보:|긴급:|breaking news|urgent/i.test(article.originalTitle || '');
      if (isBreakingTitle) {
        article.isBreaking = true;
      }
    }

    return articles;
  } catch (error) {
    console.error(`Error processing feed ${category}:`, error);
    return [];
  }
}

export default async function handler(req, res) {
  try {
    const feedEntries = Object.entries(FEEDS);
    const results = await Promise.all(
      feedEntries.map(([cat, config]) => processFeed(cat, config))
    );

    const allArticles = results.flat();
    allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 강력한 Vercel Edge Cache 적용: 
    // s-maxage=600: 전세계 Edge 네트워크에 10분(600초)간 캐싱
    // stale-while-revalidate=300: 10분이 지난 후 5분간은 기존 캐시를 반환하면서 백그라운드에서 캐시 업데이트
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
    res.status(200).json(allArticles);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
