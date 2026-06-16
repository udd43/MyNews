export const CONFIG = {
  proxies: [
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
  ],
  feeds: {
    dev: {
      url: 'https://news.hada.io/rss/news',
      type: 'atom',
      translate: false,
      label: 'Development',
      sub: '개발 · 기술 · AI · 스타트업 뉴스',
      shortDesc: '개발 · 기술 · AI',
    },
    us: {
      url: 'https://www.theguardian.com/us-news/rss',
      type: 'rss',
      translate: true,
      label: 'United States',
      sub: '미국 뉴스 · 영어 기사 자동 한국어 번역',
      shortDesc: '미국 뉴스 · 자동 번역',
    },
    kr: {
      url: 'https://news.google.com/rss/search?q=%ED%95%9C%EA%B5%AD+%EC%A0%95%EC%B9%98+OR+%EC%82%AC%EA%B1%B4%EC%82%AC%EA%B3%A0+OR+%ED%95%AB%EB%89%B4%EC%8A%A4&hl=ko&gl=KR&ceid=KR:ko',
      type: 'rss',
      translate: false,
      label: 'Korea',
      sub: '정치 · 사건사고 · 핫뉴스',
      shortDesc: '정치 · 사건사고 · 핫뉴스',
    },
  },
  maxArticles: 30,
  heroPickCount: 12,
  refreshInterval: 10 * 60 * 1000, // 10 min
  translateApiUrl: 'https://translate.googleapis.com/translate_a/single',
  translationCacheKey: 'mynews_tr_react',
  translationCacheTTL: 24 * 60 * 60 * 1000, // 24h
};

export const FONT_CLASSES = [
  'f1', 'f2', 'f3', 'f4', 'f5', 'f6',
  'f7', 'f8', 'f9', 'f10', 'f11', 'f12',
];
