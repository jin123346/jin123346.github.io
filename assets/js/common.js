'use strict';

/**
 * 공통 유틸 — 모든 페이지에서 먼저 로드됩니다.
 * 콘텐츠는 data/*.json 에만 있고, 여기서는 불러오기와 DOM 생성만 담당합니다.
 */
const App = (() => {
  async function loadJSON(name) {
    const res = await fetch(`data/${name}.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`data/${name}.json 을(를) 불러오지 못했습니다 (HTTP ${res.status})`);
    return res.json();
  }

  /**
   * 로컬 전용 비공개 정보(data/private.json, .gitignore 대상)를 profile 위에 덮어씀.
   * GitHub Pages에는 파일이 없으므로 조용히 건너뜀 → 전화번호 등은 로컬 인쇄용 PDF에만 들어감.
   */
  async function loadProfile(resume) {
    const base = resume.profile || {};
    try {
      const res = await fetch('data/private.json', { cache: 'no-cache' });
      if (!res.ok) return base;
      const priv = await res.json();
      return { ...base, ...(priv.profile || {}) };
    } catch {
      return base;
    }
  }

  /** 빈 문자열, 빈 배열, 모든 값이 빈 객체를 "비어 있음"으로 취급 → 화면에 표시하지 않음 */
  function isEmpty(v) {
    if (v == null || v === false) return true;
    if (v instanceof Node) return false;
    if (typeof v === 'string') return v.trim() === '';
    if (Array.isArray(v)) return v.every(isEmpty);
    if (typeof v === 'object') return Object.values(v).every(isEmpty);
    return false;
  }

  function clean(list) {
    return Array.isArray(list) ? list.filter((v) => !isEmpty(v)) : [];
  }

  /** h('a', { href, class }, '텍스트', childNode, [배열]) — 문자열은 항상 텍스트로 삽입(XSS 안전) */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value == null || value === false) continue;
      if (key === 'class') el.className = value;
      else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
      else el.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children.flat(Infinity)) {
      if (child == null || child === false || child === '') continue;
      el.append(child instanceof Node ? child : String(child));
    }
    return el;
  }

  function isExternal(url) {
    return /^https?:\/\//.test(url) && !url.startsWith(location.origin);
  }

  function link(url, text, attrs = {}) {
    const ext = isExternal(url) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    return h('a', { href: url, ...ext, ...attrs }, text);
  }

  function tags(list) {
    const items = clean(list);
    return items.length ? h('ul', { class: 'tags' }, items.map((t) => h('li', {}, t))) : null;
  }

  function paragraphs(text) {
    return String(text).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => h('p', {}, p));
  }

  function projectUrl(id) {
    return `project.html?id=${encodeURIComponent(id)}`;
  }

  /** 썸네일이 없거나 로딩에 실패하면 제목으로 만든 플레이스홀더 */
  function thumbnail(project) {
    const placeholder = () => h('div', { class: 'thumb placeholder', 'aria-hidden': 'true' }, project.title);
    if (isEmpty(project.thumbnail)) return placeholder();
    const img = h('img', {
      src: project.thumbnail, alt: `${project.title} 썸네일`,
      loading: 'lazy', decoding: 'async', width: 640, height: 360,
    });
    img.addEventListener('error', () => img.parentElement.replaceWith(placeholder()), { once: true });
    return h('div', { class: 'thumb' }, img);
  }

  function contacts(profile) {
    const items = [];
    if (!isEmpty(profile.email)) {
      items.push(h('li', {}, h('span', { class: 'label' }, 'Email'), link(`mailto:${profile.email}`, profile.email)));
    }
    if (!isEmpty(profile.phone)) {
      const tel = profile.phone.replace(/[^\d+]/g, '');
      items.push(h('li', {}, h('span', { class: 'label' }, 'Phone'), link(`tel:${tel}`, profile.phone)));
    }
    for (const l of clean(profile.links)) {
      if (isEmpty(l.url)) continue;
      items.push(h('li', {}, h('span', { class: 'label' }, l.label), link(l.url, l.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))));
    }
    return items.length ? h('ul', { class: 'contacts' }, items) : null;
  }

  /** PDF 파일이 있으면 그 파일, 없으면 이력서 페이지를 열고 인쇄 대화상자 호출 */
  function pdfLink(profile, className = 'btn btn-ghost') {
    return isEmpty(profile.resumePdf)
      ? h('a', { class: className, href: 'resume.html?print=1' }, 'PDF 이력서')
      : h('a', { class: className, href: profile.resumePdf, download: '' }, 'PDF 이력서 다운로드');
  }

  /** 헤더 브랜드·푸터 이름 등 data-bind="name" 요소 채우기 */
  function bindProfile(profile) {
    document.querySelectorAll('[data-bind="name"]').forEach((el) => { el.textContent = profile.name || el.textContent; });
    document.querySelectorAll('[data-bind="year"]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  function showError(container, err) {
    console.error(err);
    const hint = location.protocol === 'file:'
      ? h('p', {}, '파일을 더블클릭해서 열면 JSON을 읽을 수 없습니다. 폴더에서 ', h('code', {}, 'python -m http.server'), ' 실행 후 ', h('code', {}, 'http://localhost:8000'), ' 으로 접속하세요.')
      : h('p', {}, '잠시 후 새로고침해 주세요. JSON 문법 오류(쉼표, 따옴표)도 확인해 보세요.');
    container.replaceChildren(h('div', { class: 'status error', role: 'alert' }, h('p', {}, `콘텐츠를 불러오지 못했습니다: ${err.message}`), hint));
  }

  function render(container, nodes) {
    container.replaceChildren(...nodes.flat().filter(Boolean));
  }

  return { loadJSON, loadProfile, isEmpty, clean, h, link, tags, paragraphs, projectUrl, thumbnail, contacts, pdfLink, bindProfile, showError, render };
})();
