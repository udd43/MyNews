import { CONFIG } from './config';

let currentProxyIndex = 0;

/**
 * Fetch an RSS/Atom feed through CORS proxies with fallback.
 * Returns raw XML text.
 */
export async function fetchFeed(feedUrl) {
  for (let i = 0; i < CONFIG.proxies.length; i++) {
    const pi = (currentProxyIndex + i) % CONFIG.proxies.length;
    const proxy = CONFIG.proxies[pi];

    try {
      const proxyUrl = `${proxy}${encodeURIComponent(feedUrl)}`;
      const response = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) continue;

      const rawText = await response.text();
      let xmlText;

      if (proxy.includes('allorigins')) {
        try {
          const data = JSON.parse(rawText);
          xmlText = data.contents || rawText;
        } catch {
          xmlText = rawText;
        }
      } else {
        xmlText = rawText;
      }

      if (!xmlText || xmlText.length < 50) continue;

      currentProxyIndex = pi;
      return xmlText;
    } catch {
      continue;
    }
  }

  return null;
}
