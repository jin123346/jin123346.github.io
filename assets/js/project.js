'use strict';

(async () => {
  const { h, isEmpty, clean } = App;
  const root = document.getElementById('app');

  try {
    const [resume, projects] = await Promise.all([App.loadJSON('resume'), App.loadJSON('projects')]);
    const profile = resume.profile || {};
    App.bindProfile(profile);

    const list = clean(projects);
    const id = new URLSearchParams(location.search).get('id');
    const index = list.findIndex((p) => p.id === id);

    if (index < 0) {
      document.title = `프로젝트를 찾을 수 없습니다 | ${profile.name}`;
      App.render(root, [h('div', { class: 'status' },
        h('h1', {}, '프로젝트를 찾을 수 없습니다'),
        h('p', {}, h('a', { href: './#projects' }, '← 프로젝트 목록으로')))]);
      return;
    }

    const p = list[index];
    document.title = `${p.title} | ${profile.name} 포트폴리오`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && p.subtitle) desc.setAttribute('content', p.subtitle);

    App.render(root, [
      h('a', { class: 'back-link', href: './#projects' }, '← 프로젝트 목록'),
      renderHead(p),
      renderBody(p),
      renderPager(list[index - 1], list[index + 1]),
    ]);
  } catch (err) {
    App.showError(root, err);
  }

  function renderHead(p) {
    const meta = [p.period, p.team].filter((v) => !isEmpty(v)).join(' · ');
    const cover = isEmpty(p.thumbnail) ? null : h('div', { class: 'p-cover' },
      h('img', { src: p.thumbnail, alt: `${p.title} 대표 이미지`, loading: 'lazy', decoding: 'async', width: 1280, height: 720 }));
    return h('header', { class: 'p-head' },
      meta && h('p', { class: 'meta' }, meta),
      h('h1', {}, p.title),
      p.subtitle && h('p', { class: 'subtitle' }, p.subtitle),
      App.tags(p.tags),
      cover,
    );
  }

  function renderBody(p) {
    const blocks = [
      ['문제 정의', p.problem, text],
      ['내 역할', p.role, text],
      ['해결 방법', p.solution, text],
      [p.resultsTitle || '결과', p.results, results],
      ['사용 기술', p.tech, App.tags],
      ['스크린샷 · 자료', p.images, gallery],
      ['링크', p.links, links],
    ].filter(([, value]) => !isEmpty(value));

    if (!blocks.length) return h('p', { class: 'empty-note' }, '상세 내용을 준비하고 있습니다.');

    return blocks.map(([title, value, renderer], i) =>
      h('section', { class: 'p-section' },
        h('h2', {}, h('span', { class: 'step', 'aria-hidden': 'true' }, i + 1), title),
        renderer(value)));
  }

  /**
   * 문자열 → 문단(빈 줄로 구분)
   * 문자열 배열 → 목록
   * 객체 배열 → 소제목 블록 { title, text, items, code, image }
   */
  function text(value) {
    if (!Array.isArray(value)) return App.paragraphs(value);
    const items = clean(value);
    const plain = items.filter((v) => typeof v === 'string');
    const blocks = items.filter((v) => typeof v === 'object');
    return [
      plain.length ? h('ul', {}, plain.map((v) => h('li', {}, v))) : null,
      blocks.map((b) => h('div', { class: 'block' },
        b.title && h('h3', {}, b.title),
        b.text && App.paragraphs(b.text),
        clean(b.items).length ? h('ul', {}, clean(b.items).map((v) => h('li', {}, v))) : null,
        b.code && h('pre', { class: 'code' }, h('code', {}, b.code)),
        isEmpty(b.image) ? null : figure(b.image))),
    ];
  }

  /** .mp4/.webm 은 동영상, 그 외는 이미지 */
  function figure(media) {
    const isVideo = /\.(mp4|webm)$/i.test(media.src);
    const el = isVideo
      ? h('video', { src: media.src, controls: true, muted: true, playsinline: true, preload: 'metadata', 'aria-label': media.alt || media.caption || '' })
      : h('img', { src: media.src, alt: media.alt || media.caption || '', loading: 'lazy', decoding: 'async' });
    return h('figure', {}, el, media.caption && h('figcaption', {}, media.caption));
  }

  /** { value, label } 은 수치 카드로, 문자열은 목록으로 */
  function results(list) {
    const items = clean(list);
    const stats = items.filter((r) => typeof r === 'object' && !isEmpty(r.value));
    const notes = items.map((r) => (typeof r === 'string' ? r : isEmpty(r.value) ? r.label : null)).filter(Boolean);
    return [
      stats.length ? h('div', { class: 'stats' }, stats.map((s) =>
        h('div', { class: 'stat' }, h('div', { class: 'value' }, s.value), h('div', { class: 'label' }, s.label)))) : null,
      notes.length ? h('ul', {}, notes.map((n) => h('li', {}, n))) : null,
    ];
  }

  function gallery(images) {
    return h('div', { class: 'gallery' }, clean(images).map(figure));
  }

  function links(list) {
    return h('div', { class: 'actions' }, clean(list).filter((l) => !isEmpty(l.url)).map((l) =>
      App.link(l.url, l.label, { class: 'btn btn-ghost' })));
  }

  function renderPager(prev, next) {
    if (!prev && !next) return null;
    const item = (p, dir, cls) => h('a', { class: cls, href: App.projectUrl(p.id) },
      h('span', { class: 'dir' }, dir), h('span', { class: 'name' }, p.title));
    return h('nav', { class: 'pager', 'aria-label': '이전/다음 프로젝트' },
      prev && item(prev, '← 이전 프로젝트', 'prev'),
      next && item(next, '다음 프로젝트 →', 'next'),
    );
  }
})();
