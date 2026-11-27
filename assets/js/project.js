'use strict';

/** 프로젝트 상세 페이지 — 렌더링은 project-render.js(ProjectRender)를 portfolio.html과 같이 사용합니다. */
(async () => {
  const { h } = App;
  const root = document.getElementById('app');

  try {
    // related-posts.json 은 빌드 때 생성됩니다. 없으면(루트에서 바로 띄운 로컬 서버) 관련 글만 숨깁니다.
    const [resume, projects, related] = await Promise.all([
      App.loadJSON('resume'), App.loadJSON('projects'), App.loadJSON('related-posts').catch(() => ({})),
    ]);
    const profile = resume.profile || {};
    App.bindProfile(profile);

    const list = App.clean(projects);
    const id = new URLSearchParams(location.search).get('id');
    const index = list.findIndex((p) => p.id === id);

    if (index < 0) {
      document.title = `프로젝트를 찾을 수 없습니다 | ${profile.name}`;
      App.render(root, [h('div', { class: 'status' },
        h('h1', {}, '프로젝트를 찾을 수 없습니다'),
        h('p', {}, h('a', { href: 'projects.html' }, '← 프로젝트 목록으로')))]);
      return;
    }

    const p = list[index];
    document.title = `${p.title} | ${profile.name} 포트폴리오`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && p.subtitle) desc.setAttribute('content', p.subtitle);

    App.render(root, [
      h('a', { class: 'back-link', href: 'projects.html' }, '← 프로젝트 목록'),
      ProjectRender.head(p),
      ProjectRender.body(p, related[p.id]),
      ProjectRender.pager(list[index - 1], list[index + 1]),
    ]);
  } catch (err) {
    App.showError(root, err);
  }
})();
