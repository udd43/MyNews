import { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { relativeTime } from '../lib/utils';
import { useMediaQuery } from '../hooks/useMediaQuery';

function ExpandedArticle({ url, tr }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/read?url=${encodeURIComponent(url)}&tr=${tr}`);
        if (!res.ok) throw new Error('기사를 불러오지 못했습니다.');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (isMounted) setContent(data.content);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchArticle();
    return () => { isMounted = false; };
  }, [url, tr]);

  if (loading) {
    return <div className="expanded-msg">내용을 불러오는 중...</div>;
  }
  if (error) {
    return <div className="expanded-msg error">{error}</div>;
  }
  return (
    <div 
      className="ap-html inline-html" 
      dangerouslySetInnerHTML={{ __html: content }} 
      onClick={(e) => e.stopPropagation()}
    />
  );
}

const ListItem = memo(function ListItem({ article, index }) {
  const timeAgo = relativeTime(article.date);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [expanded, setExpanded] = useState(false);

  const trParam = article.translated ? '1' : '0';
  const articleUrl = `/article?url=${encodeURIComponent(article.link)}&tr=${trParam}`;

  if (isMobile) {
    return (
      <div
        className={`list-item mobile-item ${expanded ? 'expanded' : ''} ${article.isBreaking ? 'breaking-pulse' : ''}`}
        style={{ animationDelay: `${0.025 * index}s` }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="mobile-item-header">
          <span className="li-num">{String(index + 1).padStart(2, '0')}</span>
          <div className="li-content-wrapper">
            <div className="li-body">
              <div className="li-meta">
                <span className="li-src">{article.source}</span>
                <span className="li-dot" />
                <span className="li-time">{timeAgo}</span>
                {article.translated && <span className="li-tr">번역됨</span>}
                {article.isBreaking && <span className="li-breaking-badge">[속보]</span>}
              </div>
              <a 
                href={article.link} 
                className="li-title" 
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {article.title}
              </a>
              {article.description && !expanded && (
                <p className="li-desc">{article.description}</p>
              )}
            </div>
            {article.imageUrl && !expanded && (
              <div className="li-thumb">
                <img src={article.imageUrl} alt="" loading="lazy" />
              </div>
            )}
          </div>
        </div>
        
        {expanded && (
          <div className="expanded-content">
            <ExpandedArticle url={article.link} tr={trParam} />
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      className={`list-item ${article.isBreaking ? 'breaking-pulse' : ''}`}
      to={articleUrl}
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
            {article.isBreaking && <span className="li-breaking-badge">[속보]</span>}
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
    </Link>
  );
});

export default ListItem;
