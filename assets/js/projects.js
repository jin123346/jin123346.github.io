'use strict';

/** 프로젝트 목록 페이지: projects.json 을 묶음별 카드로 표시합니다. */
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
    App.bindProfile(resume.profile || {});
    App.render(root, [
      h('header', { class: 'p-head projects-head' },
        h('h1', {}, '프로젝트'),
        h('p', { class: 'subtitle' }, '실무와 개인·팀 프로젝트의 문제 정의, 역할, 해결 방법, 결과를 정리했습니다.')),
      renderProjects(projects),
    ]);
  } catch (err) {
    App.showError(root, err);
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

    return h('section', { id: 'projects', 'aria-label': '프로젝트 목록' },
      groups.filter((x) => x.items.length).map((x) => h('div', { class: 'project-group' },
        h('h2', { class: 'group-title' }, x.title, h('span', { class: 'count' }, x.items.length)),
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
