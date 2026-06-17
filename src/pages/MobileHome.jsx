import { useState, useMemo } from 'react';
import ListItem from '../components/ListItem';

export default function MobileHome({ articles }) {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'dev', label: '개발' },
    { id: 'us', label: '미국' },
    { id: 'kr', label: '국내' },
  ];

  const filteredArticles = useMemo(() => {
    if (activeTab === 'all') return articles;
    return articles.filter((a) => a.category === activeTab);
  }, [articles, activeTab]);

  return (
    <div className="mobile-home">
      <div className="mobile-tabs-container">
        <div className="mobile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`mobile-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="cat-list mobile-list">
        {filteredArticles.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">📭</div>
            <p className="empty-txt">기사가 없습니다</p>
          </div>
        ) : (
          filteredArticles.map((article, i) => (
            <ListItem key={`${article.category}-${i}`} article={article} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
