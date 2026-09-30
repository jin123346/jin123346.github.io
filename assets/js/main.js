'use strict';

/**
 * 메인 = 포트폴리오: 짧은 소개 + 프로젝트 카드
 * 경력·역량·학력 등 나머지는 모두 이력서 페이지(resume.html)에서 다룹니다.
 */
(async () => {
  const { h, isEmpty, clean } = App;
  const root = document.getElementById('app');

  /** projects.json 의 category 값별로 묶어서 표시 (순서도 이 목록 순서) */
  const GROUPS = [
    { key: 'work', title: (items) => `실무${items[0].org ? ` · ${items[0].org}` : ''}` },
    { key: 'personal', title: () => '개인 프로젝트' },
    { key: 'team', title: () => '팀 프로젝트 (교육과정)' },
  ];

  try {
    const [resume, projects] = await Promise.all([App.loadJSON('resume'), App.loadJSON('projects')]);
    const profile = await App.loadProfile(resume);
    App.bindProfile(profile);
    App.render(root, [renderHero(profile), renderProjects(projects)]);
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

  function renderProjects(all) {
    const list = clean(all);
    const featured = list.filter((p) => p.featured);
    const items = featured.length ? featured : list;
    if (!items.length) return null;

    const known = GROUPS.map((g) => g.key);
    const groups = GROUPS.map((g) => {
      const members = items.filter((p) => p.category === g.key);
      return { title: members.length ? g.title(members) : '', items: members };
    });
    const rest = items.filter((p) => !known.includes(p.category));
    if (rest.length) groups.push({ title: '기타', items: rest });

    return h('section', { class: 'section', id: 'projects', 'aria-labelledby': 'projects-title' },
      h('div', { class: 'section-head' }, h('h2', { id: 'projects-title' }, '프로젝트')),
      groups.filter((x) => x.items.length).map((x) => h('div', { class: 'project-group' },
        h('h3', { class: 'group-title' }, x.title, h('span', { class: 'count' }, x.items.length)),
        h('div', { class: 'project-grid' }, x.items.map(card)),
      )),
    );
  }

  function card(p) {
    const meta = [p.period, p.team].filter((v) => !isEmpty(v)).join(' · ');
    return h('a', { class: 'card', href: App.projectUrl(p.id) },
      App.thumbnail(p),
      h('div', { class: 'card-body' },
        meta && h('span', { class: 'meta' }, meta),
        h('h3', {}, p.title),
        p.subtitle && h('p', {}, p.subtitle),
        App.tags(p.tags),
      ),
    );
  }
})();
