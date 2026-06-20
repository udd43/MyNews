import { useMemo } from 'react';
import { CONFIG } from '../lib/config';
import FlowText from '../components/FlowText';
import CategoryStats from '../components/CategoryStats';
import { useMediaQuery } from '../hooks/useMediaQuery';
import MobileHome from './MobileHome';

export default function HeroPage({ articles }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const heroPicks = useMemo(() => {
    const byCategory = {
      dev: articles.filter((a) => a.category === 'dev'),
      us: articles.filter((a) => a.category === 'us'),
      kr: articles.filter((a) => a.category === 'kr'),
      game: articles.filter((a) => a.category === 'game'),
    };

    const picks = [];
    const sources = [byCategory.dev, byCategory.us, byCategory.kr, byCategory.game];
    const maxPer = Math.ceil(CONFIG.heroPickCount / 4);

    for (let i = 0; i < maxPer; i++) {
      for (const src of sources) {
        if (i < src.length && picks.length < CONFIG.heroPickCount) {
          picks.push(src[i]);
        }
      }
    }
    return picks;
  }, [articles]);

  if (isMobile) {
    return <MobileHome articles={articles} />;
  }

  return (
    <section className="hero">
      <FlowText articles={heroPicks} />
      <CategoryStats articles={articles} />
    </section>
  );
}
