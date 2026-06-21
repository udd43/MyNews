import { memo } from 'react';
import { Link } from 'react-router-dom';
import { CONFIG } from '../lib/config';

const CategoryStats = memo(function CategoryStats({ articles }) {
  const counts = articles.reduce((acc, a) => {
    if (a.category) acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="hero-cats">
      {Object.entries(CONFIG.feeds).map(([key, feed]) => (
        <Link key={key} className="hero-cat" to={`/${key}`}>
          <div className="hero-cat-name">{feed.label}</div>
          <div className="hero-cat-num">{counts[key] || '—'}</div>
          <div className="hero-cat-desc">{feed.shortDesc}</div>
        </Link>
      ))}
    </div>
  );
});

export default CategoryStats;
