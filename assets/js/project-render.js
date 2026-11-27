'use strict';

/**
 * 프로젝트 상세 렌더링 — project.html(상세 페이지)과 portfolio.html(전체 PDF)이 같이 사용합니다.
 *   ProjectRender.head(p, opts)         제목·메타·부제·태그·대표 이미지
 *   ProjectRender.body(p, posts, opts)  문제 정의 ~ 링크(·관련 글) 섹션
 *   ProjectRender.pager(prev, next)     이전/다음 프로젝트
 * opts.print = true 이면: 관련 글 제외, 이미지 즉시 로딩, 링크를 사이트 절대 주소로 연결
 */
const ProjectRender = (() => {
  const { h, isEmpty, clean } = App;
  const SITE_URL = 'https://jin123346.github.io/';

  /** assets/files/a.pdf → https://jin123346.github.io/assets/files/a.pdf (https:, mailto: 등은 그대로) */
  function absUrl(url) {
    if (/^[a-z][a-z\d+.-]*:/i.test(url)) return url;
    return new URL(String(url).replace(/^\.?\//, ''), SITE_URL).href;
  }

  /** 인쇄용 주소 글자: 프로토콜·끝 슬래시를 빼고, %EC.. 같은 인코딩은 한글로 */
  function displayUrl(url) {
    let u = absUrl(url);
    try { u = decodeURI(u); } catch { /* 그대로 표시 */ }
    return u.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  function head(p, o = {}) {
    const meta = [p.period, p.team].filter((v) => !isEmpty(v)).join(' · ');
    const cover = isEmpty(p.thumbnail) ? null : h('div', { class: 'p-cover' },
      h('img', { src: p.thumbnail, alt: `${p.title} 대표 이미지`, loading: o.print ? 'eager' : 'lazy', decoding: 'async', width: 1280, height: 720 }));
    return h('header', { class: 'p-head' },
      meta && h('p', { class: 'meta' }, meta),
      h('h1', {}, p.title),
      p.subtitle && h('p', { class: 'subtitle' }, p.subtitle),
      App.tags(p.tags),
      cover,
    );
  }

  function body(p, posts, o = {}) {
    const blocks = [
      ['문제 정의', p.problem, text],
      ['내 역할', p.role, text],
      ['해결 방법', p.solution, text],
      [p.resultsTitle || '결과', p.results, results],
      ['사용 기술', p.tech, App.tags],
      ['스크린샷 · 자료', p.images, gallery],
      ['링크', p.links, links],
      ['관련 글', o.print ? null : posts, relatedPosts],
    ].filter(([, value]) => !isEmpty(value));

    if (!blocks.length) return h('p', { class: 'empty-note' }, '상세 내용을 준비하고 있습니다.');

    return blocks.map(([title, value, renderer], i) =>
      h('section', { class: 'p-section' },
        h('h2', {}, h('span', { class: 'step', 'aria-hidden': 'true' }, i + 1), title),
        renderer(value, o)));
  }

  /**
   * 문자열 → 문단(빈 줄로 구분)
   * 문자열 배열 → 목록
   * 객체 배열 → 소제목 블록 { title, text, items, code, image }
   */
  function text(value, o = {}) {
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
        b.table && dataTable(b.table),
        isEmpty(b.image) ? null : figure(b.image, o))),
    ];
  }

  /** .mp4/.webm 은 동영상(인쇄 시에는 주소 안내로 대체), 그 외는 이미지 */
  function figure(media, o = {}) {
    const isVideo = /\.(mp4|webm)$/i.test(media.src);
    const el = isVideo
      ? h('video', { src: media.src, controls: true, muted: true, playsinline: true, preload: 'metadata', 'aria-label': media.alt || media.caption || '' })
      : h('img', { src: media.src, alt: media.alt || media.caption || '', loading: o.print ? 'eager' : 'lazy', decoding: 'async' });
    const note = isVideo
      ? h('p', { class: 'print-only video-note' }, '영상 자료: ', h('a', { href: absUrl(media.src) }, displayUrl(media.src)))
      : null;
    return h('figure', {}, el, note, media.caption && h('figcaption', {}, media.caption));
  }

  /**
   * { value, label } → 수치 카드
   * { head: [...], rows: [[...]], caption } → 비교 표
   * 문자열 → 목록
   */
  function results(list) {
    const items = clean(list);
    const stats = items.filter((r) => typeof r === 'object' && !isEmpty(r.value));
    const tables = items.filter((r) => typeof r === 'object' && Array.isArray(r.rows));
    const notes = items.map((r) => (typeof r === 'string' ? r : isEmpty(r.value) && !r.rows ? r.label : null)).filter(Boolean);
    return [
      stats.length ? h('div', { class: 'stats' }, stats.map((s) =>
        h('div', { class: 'stat' }, h('div', { class: 'value' }, s.value), h('div', { class: 'label' }, s.label)))) : null,
      tables.map(dataTable),
      notes.length ? h('ul', {}, notes.map((n) => h('li', {}, n))) : null,
    ];
  }

  function dataTable(t) {
    return h('div', { class: 'table-wrap' },
      h('table', { class: t.wrap ? 'data-table wrap' : 'data-table' },
        t.caption && h('caption', {}, t.caption),
        clean(t.head).length ? h('thead', {}, h('tr', {}, t.head.map((c) => h('th', { scope: 'col' }, c)))) : null,
        h('tbody', {}, t.rows.map((row) => h('tr', {}, row.map((c, i) => (i === 0 ? h('th', { scope: 'row' }, c) : h('td', {}, c)))))),
      ),
    );
  }

  function gallery(images, o = {}) {
    return h('div', { class: 'gallery' }, clean(images).map((img) => figure(img, o)));
  }

  /** 화면: 버튼 / 인쇄: "라벨 주소" 목록 (주소 글자도 링크 안에 있어 PDF에서 눌러짐) */
  function links(list, o = {}) {
    return h('div', { class: 'actions p-links' }, clean(list).filter((l) => !isEmpty(l.url)).map((l) =>
      App.link(o.print ? absUrl(l.url) : l.url,
        [l.label, h('span', { class: 'print-url' }, displayUrl(l.url))],
        { class: 'btn btn-ghost' })));
  }

  function relatedPosts(posts) {
    return h('ul', {}, posts.map((post) => h('li', {}, h('a', { href: post.url }, post.title), ` · ${post.date}`)));
  }

  function pager(prev, next) {
    if (!prev && !next) return null;
    const item = (p, dir, cls) => h('a', { class: cls, href: App.projectUrl(p.id) },
      h('span', { class: 'dir' }, dir), h('span', { class: 'name' }, p.title));
    return h('nav', { class: 'pager', 'aria-label': '이전/다음 프로젝트' },
      prev && item(prev, '← 이전 프로젝트', 'prev'),
      next && item(next, '다음 프로젝트 →', 'next'),
    );
  }

  return { head, body, pager, absUrl, displayUrl };
})();
