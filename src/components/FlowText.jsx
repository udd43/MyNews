import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FONT_CLASSES } from '../lib/config';

const FlowText = memo(function FlowText({ articles }) {
  const content = useMemo(() => {
    if (!articles.length) {
      return (
        <span style={{ color: 'var(--text-dim)', fontSize: '18px' }}>
          뉴스를 불러오는 중...
        </span>
      );
    }

    return articles.map((article, i) => {
      const trParam = article.translated ? '1' : '0';
      const articleUrl = `/article?url=${encodeURIComponent(article.link)}&tr=${trParam}`;

      return (
        <span key={`${article.category}-${i}`}>
          <Link
            className={`flow-link ${FONT_CLASSES[i % FONT_CLASSES.length]} ${article.isBreaking ? 'flow-breaking' : ''}`}
            to={articleUrl}
          >
            {article.title}
          </Link>
          <span className="flow-sep">{i < articles.length - 1 ? '. ' : '.'}</span>
        </span>
      );
    });
  }, [articles]);

  return <div className="flow-text">{content}</div>;
});

export default FlowText;
