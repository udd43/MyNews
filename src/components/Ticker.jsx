import { memo, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Ticker = memo(function Ticker({ articles }) {
  const breakingArticles = useMemo(() => articles.filter(a => a.isBreaking), [articles]);

  useEffect(() => {
    if (breakingArticles && breakingArticles.length > 0) {
      document.body.classList.add('has-ticker');
      return () => document.body.classList.remove('has-ticker');
    }
  }, [breakingArticles]);

  if (!breakingArticles || breakingArticles.length === 0) return null;

  // Duplicate items to create a seamless marquee loop
  const displayItems = [...breakingArticles, ...breakingArticles, ...breakingArticles, ...breakingArticles];

  return (
    <div className="ticker-container">
      <div className="ticker-track">
        {displayItems.map((article, i) => {
          const trParam = article.translated ? '1' : '0';
          const articleUrl = `/article?url=${encodeURIComponent(article.link)}&tr=${trParam}`;
          return (
            <span key={i} className="ticker-item">
              <span className="ticker-badge">[속보]</span>
              <a href={article.link} target="_blank" rel="noreferrer" className="ticker-link">
                {article.title}
              </a>
            </span>
          );
        })}
      </div>
    </div>
  );
});

export default Ticker;
