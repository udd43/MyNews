import { useState, useEffect, useCallback, useRef } from 'react';
import { CONFIG } from '../lib/config';
import { fetchFeed } from '../lib/fetcher';
import { parseArticles } from '../lib/parser';
import { translateArticles, loadTranslationCache } from '../lib/translator';

export function useNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const fetchAllNews = useCallback(async () => {
    const feedEntries = Object.entries(CONFIG.feeds);

    const results = await Promise.allSettled(
      feedEntries.map(async ([category, feed]) => {
        const xmlText = await fetchFeed(feed.url);
        if (!xmlText) return [];
        const parsed = parseArticles(xmlText, category, feed.type);
        return parsed.slice(0, CONFIG.maxArticles);
      })
    );

    const allArticles = [];
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        allArticles.push(...result.value);
      }
    });

    // Sort by date (newest first)
    allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Translate US articles
    const translated = await translateArticles(allArticles);

    setArticles(translated);
    setLoading(false);

    return translated;
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    loadTranslationCache();
    fetchAllNews();

    // Auto-refresh
    const timer = setInterval(fetchAllNews, CONFIG.refreshInterval);
    return () => clearInterval(timer);
  }, [fetchAllNews]);

  const refresh = useCallback(() => {
    setLoading(true);
    return fetchAllNews();
  }, [fetchAllNews]);

  return { articles, loading, refresh };
}
