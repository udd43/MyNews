import { memo, useMemo } from 'react';
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

    return articles.map((article, i) => (
      <span key={`${article.category}-${i}`}>
        <a
          className={`flow-link ${FONT_CLASSES[i % FONT_CLASSES.length]}`}
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {article.title}
        </a>
        <span className="flow-sep">{i < articles.length - 1 ? '. ' : '.'}</span>
      </span>
    ));
  }, [articles]);

  return <div className="flow-text">{content}</div>;
});

export default FlowText;
