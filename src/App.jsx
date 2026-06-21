import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import Loader from './components/Loader';
import Toast from './components/Toast';
import Ticker from './components/Ticker';
import { useNews } from './hooks/useNews';

const HeroPage = lazy(() => import('./pages/HeroPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  const { articles, loading } = useNews();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Loader visible={loading} />
      <Toast />
      <Nav />
      <Ticker articles={articles} />
      <Suspense fallback={<Loader visible />}>
        <Routes>
          <Route path="/" element={<HeroPage articles={articles} />} />
          <Route path="/article" element={<ArticlePage />} />
          <Route path="/:category" element={<CategoryPage articles={articles} />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
