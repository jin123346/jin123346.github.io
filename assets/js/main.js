'use strict';

/**
 * 메인 = 블로그형 첫 화면: 왼쪽 프로필·바로가기 + 오른쪽 최근 글
 * 프로젝트는 projects.html, 경력·역량·학력 등은 resume.html 에서 다룹니다.
 */
(async () => {
  const { h } = App;
  const root = document.getElementById('app');

  // 프로젝트가 홈에 있던 때의 링크(/#projects)를 새 페이지로 연결합니다.
  if (location.hash === '#projects') {
    location.replace('projects.html');
    return;
  }

  try {
    // recent-posts.json 은 빌드 때 생성됩니다. 루트에서 바로 띄운 로컬 서버에서는 빈 목록으로 표시합니다.
    const [resume, posts] = await Promise.all([App.loadJSON('resume'), App.loadJSON('recent-posts').catch(() => [])]);
    const profile = await App.loadProfile(resume);
    App.bindProfile(profile);
    App.render(root, [h('div', { class: 'home-layout' },
      h('aside', { class: 'home-side' }, renderHero(profile), renderQuickLinks()),
      h('div', { class: 'home-main' }, renderRecentPosts(posts), renderGithub()),
    )]);
  } catch (err) {
    App.showError(root, err);
  }

  function renderHero(p) {
    return h('section', { class: 'hero' },
      p.title && h('p', { class: 'eyebrow' }, p.title),
      h('h1', {}, p.name),
      p.tagline && h('p', { class: 'tagline' }, p.tagline),
      (p.summary || p.intro) && h('div', { class: 'intro' }, App.paragraphs(p.summary || p.intro)),
      App.contacts(p),
      h('div', { class: 'actions' },
        h('a', { class: 'btn btn-primary', href: 'resume.html' }, '이력서 보기'),
        App.pdfLink(p),
      ),
    );
  }

  function renderQuickLinks() {
    const items = [
      ['이력서', 'resume.html'],
      ['프로젝트', 'projects.html'],
      ['경력기술서', 'resume.html#career-detail'],
      ['블로그', 'blog/'],
    ];
    return h('nav', { class: 'quick-links', 'aria-label': '바로가기' }, items.map(([title, href]) =>
      h('a', { href }, title, h('span', { 'aria-hidden': 'true' }, '→'))));
  }

  function renderGithub() {
    const user = 'jin123346';
    // ponytail: 외부 이미지 서비스에 의존. 사라지면 Actions에서 GitHub GraphQL로 빌드 때 직접 생성.
    const section = h('section', { class: 'section', 'aria-labelledby': 'github-title' },
      h('div', { class: 'section-head' },
        h('h2', { id: 'github-title' }, 'GitHub 활동'),
        App.link(`https://github.com/${user}`, 'GitHub 보기 →')),
      h('div', { class: 'github-graph' },
        h('img', {
          src: `https://ghchart.rshah.org/2f5d50/${user}`, alt: `${user}의 최근 1년 GitHub 기여 그래프`,
          width: 663, height: 104, loading: 'lazy', decoding: 'async', onerror: () => section.remove(),
          // 좁은 화면에서 가장 최근 활동이 먼저 보이도록
          onload: (e) => { e.target.parentElement.scrollLeft = e.target.parentElement.scrollWidth; },
        })),
    );
    return section;
  }

  function renderRecentPosts(posts) {
    return h('section', { class: 'section', 'aria-labelledby': 'recent-title' },
      h('div', { class: 'section-head' },
        h('h2', { id: 'recent-title' }, '최근 글'),
        h('a', { href: 'blog/' }, '전체 글 보기 →')),
      posts.length
        ? h('ul', { class: 'recent-posts' }, posts.map((p) => h('li', {},
          h('span', { class: 'meta' }, `${p.category} · ${p.date} · 약 ${p.minutes}분`),
          h('h3', {}, h('a', { href: p.url }, p.title)),
          h('p', {}, p.description))))
        : h('p', { class: 'empty-note' }, '첫 글을 준비하고 있습니다.'),
    );
  }
})();
