import { useState, useEffect, useCallback, useRef } from 'react';

export function useNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const fetchAllNews = useCallback(async () => {
    try {
      const response = await fetch('/api/news');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetchAllNews();

    // 10분마다 클라이언트에서 새로고침 요청 (실제로는 Vercel Edge Cache에서 빠르게 가져옴)
    const timer = setInterval(fetchAllNews, 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, [fetchAllNews]);

  const refresh = useCallback(() => {
    setLoading(true);
    return fetchAllNews();
  }, [fetchAllNews]);

  return { articles, loading, refresh };
}
