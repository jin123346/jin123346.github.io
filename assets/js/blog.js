'use strict';

/* 블로그 목록(검색·필터)과 게시글(목차·코드 복사). 게시글 HTML은 빌드 때 생성되므로 JS 없이도 읽을 수 있습니다. */

// 코드 복사
for (const btn of document.querySelectorAll('.copy-btn')) {
  btn.hidden = false;
  btn.addEventListener('click', async () => {
    const code = btn.closest('.code-block').querySelector('code').textContent;
    try {
      await navigator.clipboard.writeText(code);
      btn.textContent = '복사됨';
    } catch {
      btn.textContent = '복사 실패';
    }
    setTimeout(() => { btn.textContent = '복사'; }, 1500);
  });
}

// 목차: 넓은 화면은 항상 펼침, 좁은 화면은 접힘
const toc = document.getElementById('toc');
if (toc) {
  const wide = matchMedia('(min-width: 1040px)');
  const syncToc = () => { toc.open = wide.matches; };
  wide.addEventListener('change', syncToc);
  syncToc();

  // 현재 읽고 있는 제목 강조
  const links = new Map([...toc.querySelectorAll('a')].map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach((a) => a.removeAttribute('aria-current'));
      links.get(entry.target.id)?.setAttribute('aria-current', 'true');
    }
  }, { rootMargin: '-80px 0px -70% 0px' });
  links.forEach((_, id) => {
    const heading = document.getElementById(id);
    if (heading) observer.observe(heading);
  });
}

// 목록 검색·필터
const finder = document.getElementById('blog-finder');
if (finder) {
  finder.hidden = false;
  const params = new URLSearchParams(location.search);
  const state = { q: params.get('q') || '', category: params.get('category') || '', tag: params.get('tag') || '' };
  const input = document.getElementById('blog-search');
  const chips = [...finder.querySelectorAll('.chip')];
  const cards = [...document.querySelectorAll('.post-card')];
  const count = document.getElementById('blog-count');
  const empty = document.getElementById('blog-empty');
  let bodies = {};

  function apply() {
    const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const card of cards) {
      const { slug, category, tags } = card.dataset;
      const haystack = `${card.textContent.toLowerCase()} ${bodies[slug] || ''}`;
      const match = (!state.category || category === state.category)
        && (!state.tag || JSON.parse(tags).includes(state.tag))
        && terms.every((t) => haystack.includes(t));
      card.parentElement.hidden = !match;
      if (match) shown += 1;
    }
    for (const chip of chips) chip.setAttribute('aria-pressed', String(state[chip.dataset.filter] === chip.dataset.value));
    const filtered = terms.length || state.category || state.tag;
    count.textContent = filtered ? `검색 결과 ${shown}개` : `글 ${shown}개`;
    empty.hidden = shown > 0;

    const next = new URLSearchParams(Object.entries(state).filter(([, v]) => v));
    history.replaceState(null, '', next.size ? `?${next}` : location.pathname);
  }

  input.value = state.q;
  input.addEventListener('input', () => { state.q = input.value.trim(); apply(); });
  finder.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const { filter, value } = chip.dataset;
    state[filter] = state[filter] === value ? '' : value;
    apply();
  });
  apply();

  // 본문 색인은 나중에 도착해도 됩니다. 실패하면 제목·요약·태그 검색만 동작합니다.
  fetch('/blog/search.json')
    .then((res) => (res.ok ? res.json() : {}))
    .then((data) => { bodies = data; if (state.q) apply(); })
    .catch(() => {});
}
