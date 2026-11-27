'use strict';

/**
 * 포트폴리오 전체 PDF = 표지(이름·직함·연락처·목차) + 프로젝트마다 새 페이지에 상세 내용
 * portfolio.html?print=1 로 열면 이미지 로딩 후 바로 인쇄 대화상자를 띄웁니다.
 */
(async () => {
  const { h, isEmpty, clean } = App;
  const root = document.getElementById('app');

  try {
    const [resume, projects] = await Promise.all([App.loadJSON('resume'), App.loadJSON('projects')]);
    // 로컬에서는 data/private.json(전화번호 등)이 표지에 들어갑니다 — resume.html과 같은 방식
    const profile = await App.loadProfile(resume);
    App.bindProfile(profile);
    // 인쇄 시 PDF 기본 파일명이 됩니다.
    document.title = `${profile.name} 포트폴리오`;

    const list = clean(projects);
    App.render(root, [
      h('div', { class: 'pf-toolbar no-print' },
        h('p', {}, `표지와 프로젝트 ${list.length}개를 한 PDF로 저장합니다. 인쇄 창에서 대상을 "PDF로 저장"으로 고르면 링크도 눌러집니다.`),
        h('button', { class: 'btn btn-primary', type: 'button', id: 'pf-print' }, '전체 PDF')),
      renderCover(profile, list),
      list.map((p) => h('article', { class: 'pf-project', id: `pf-${p.id}` },
        ProjectRender.head(p, { print: true }),
        ProjectRender.body(p, null, { print: true }))),
    ]);

    const btn = document.getElementById('pf-print');
    const print = async () => {
      btn.disabled = true;
      btn.textContent = '이미지 불러오는 중…';
      await ready(root);
      btn.disabled = false;
      btn.textContent = '전체 PDF';
      window.print();
    };
    btn.addEventListener('click', print);

    if (new URLSearchParams(location.search).get('print')) setTimeout(print, 150);
  } catch (err) {
    App.showError(root, err);
  }

  function renderCover(p, list) {
    return h('section', { class: 'pf-cover' },
      h('p', { class: 'eyebrow' }, 'PORTFOLIO'),
      h('h1', {}, p.name),
      p.title && h('p', { class: 'title' }, p.title),
      p.tagline && h('p', { class: 'tagline' }, p.tagline),
      App.contacts(p),
      h('h2', {}, '목차'),
      h('ol', { class: 'pf-toc' }, list.map((x) => {
        const meta = [x.period, x.team].filter((v) => !isEmpty(v)).join(' · ');
        return h('li', {},
          h('a', { href: `#pf-${x.id}` }, x.title),
          x.subtitle && h('span', { class: 'sub' }, x.subtitle),
          meta && h('span', { class: 'meta' }, meta));
      })),
    );
  }

  /** 폰트·이미지 로딩과 디코딩이 끝날 때까지 대기 (실패한 이미지는 건너뜀, 최대 15초) */
  async function ready(scope) {
    const wait = (async () => {
      if (document.fonts) await document.fonts.ready;
      const imgs = [...scope.querySelectorAll('img')];
      await Promise.all(imgs.map((img) => (img.complete ? null : new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }))));
      await Promise.all(imgs.map((img) => (img.decode ? img.decode().catch(() => {}) : null)));
    })();
    await Promise.race([wait, new Promise((resolve) => setTimeout(resolve, 15000))]);
  }
})();
