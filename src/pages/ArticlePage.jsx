import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

export default function ArticlePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get('url');
  const tr = searchParams.get('tr') || '0';

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!url) {
      setError('유효하지 않은 URL입니다.');
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/read?url=${encodeURIComponent(url)}&tr=${tr}`);
        if (!res.ok) throw new Error('기사를 불러오지 못했습니다.');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setArticle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [url, tr]);

  if (loading) return <Loader visible={true} />;

  if (error) {
    return (
      <div className="article-page error">
        <div className="ap-head">
          <button onClick={() => navigate(-1)} className="ap-back">← 뒤로가기</button>
        </div>
        <div className="ap-error">
          <p>{error}</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="ap-btn">
            원본 사이트에서 보기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      <div className="ap-head">
        <button onClick={() => navigate(-1)} className="ap-back">← 뒤로가기</button>
        <a href={url} target="_blank" rel="noopener noreferrer" className="ap-btn-outline">
          원본 보기
        </a>
      </div>
      <div className="ap-content">
        <h1 className="ap-title">{article.title}</h1>
        {article.byline && <p className="ap-byline">{article.byline}</p>}
        <div
          className="ap-html"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
      <div className="ap-footer">
        <a href={url} target="_blank" rel="noopener noreferrer" className="ap-btn">
          원본 사이트에서 계속 읽기 →
        </a>
      </div>
    </div>
  );
}
