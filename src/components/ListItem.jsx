import { memo } from 'react';
import { relativeTime } from '../lib/utils';

const ListItem = memo(function ListItem({ article, index }) {
  const timeAgo = relativeTime(article.date);

  return (
    <a
      className="list-item"
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ animationDelay: `${0.025 * index}s` }}
    >
      <span className="li-num">{String(index + 1).padStart(2, '0')}</span>
      <div className="li-content-wrapper">
        <div className="li-body">
          <div className="li-meta">
            <span className="li-src">{article.source}</span>
            <span className="li-dot" />
            <span className="li-time">{timeAgo}</span>
            {article.translated && <span className="li-tr">번역됨</span>}
          </div>
          <h2 className="li-title">{article.title}</h2>
          {article.description && <p className="li-desc">{article.description}</p>}
        </div>
        {article.imageUrl && (
          <div className="li-thumb">
            <img src={article.imageUrl} alt="" loading="lazy" />
          </div>
        )}
      </div>
      <span className="li-arrow">→</span>
    </a>
  );
});

export default ListItem;
