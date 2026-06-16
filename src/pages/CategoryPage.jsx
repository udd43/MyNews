import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CONFIG } from '../lib/config';
import ListItem from '../components/ListItem';

export default function CategoryPage({ articles }) {
  const { category } = useParams();
  const feed = CONFIG.feeds[category];

  const filtered = useMemo(
    () => articles.filter((a) => a.category === category),
    [articles, category]
  );

  if (!feed) {
    return (
      <section className="cat-page on">
        <div className="cat-head">
          <Link to="/" className="cat-back">← 메인으로</Link>
          <h1 className="cat-title">404</h1>
          <p className="cat-sub">카테고리를 찾을 수 없습니다</p>
        </div>
      </section>
    );
  }

  const accentClass = `cp-${category}`;

  return (
    <section className={`cat-page on ${accentClass}`}>
      <div className="cat-head">
        <Link to="/" className="cat-back">
          ← 메인으로
        </Link>
        <h1 className="cat-title">{feed.label}</h1>
        <p className="cat-sub">{feed.sub}</p>
        <p className="cat-cnt">{filtered.length}개의 기사</p>
      </div>
      <div className="cat-list">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">📭</div>
            <p className="empty-txt">기사가 없습니다</p>
          </div>
        ) : (
          filtered.map((article, i) => (
            <ListItem key={`${article.category}-${i}`} article={article} index={i} />
          ))
        )}
      </div>
    </section>
  );
}
