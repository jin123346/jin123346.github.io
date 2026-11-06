/**
 * 정적 사이트 빌드: 기존 페이지를 _site/ 로 복사하고 content/blog/*.md 를 HTML로 생성합니다.
 *   npm run build         운영용 (draft: true 제외)
 *   npm run build:drafts  로컬 확인용 (초안 포함)
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import hljs from 'highlight.js';
import { load as parseYaml } from 'js-yaml';
import { Marked } from 'marked';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SITE_URL = 'https://jin123346.github.io';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dot = (date) => date.replaceAll('-', '.');

function slugify(text, seen) {
  const base = text.replace(/&#?\w+;/g, ' ').toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s+/g, '-') || 'section';
  const n = seen.get(base) || 0;
  seen.set(base, n + 1);
  return n ? `${base}-${n}` : base;
}

/** Markdown → { html, toc }. 코드 강조는 빌드 때 끝내므로 방문자 브라우저에 강조 라이브러리가 필요 없습니다. */
function renderMarkdown(body) {
  const toc = [];
  const seen = new Map();
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const text = inner.replace(/<[^>]+>/g, '');
        const id = slugify(text, seen);
        if (depth <= 3) toc.push({ depth, id, text });
        return `<h${depth} id="${esc(id)}">${inner} <a class="heading-anchor" href="#${esc(id)}" aria-label="이 제목으로 바로가기">#</a></h${depth}>\n`;
      },
      code({ text, lang }) {
        const language = (lang || '').split(/\s/)[0];
        const code = hljs.getLanguage(language) ? hljs.highlight(text, { language }).value : esc(text);
        return `<figure class="code-block"><div class="code-head"><span>${esc(language || 'text')}</span><button type="button" class="copy-btn" hidden>복사</button></div>`
          + `<pre class="code" tabindex="0"><code class="hljs">${code}</code></pre></figure>\n`;
      },
    },
  });
  const html = marked.parse(body)
    .replaceAll('<table>', '<div class="table-wrap"><table class="data-table wrap">')
    .replaceAll('</table>', '</table></div>')
    .replaceAll('<img ', '<img loading="lazy" decoding="async" ');
  return { html, toc };
}

function normalizeDate(value, file, field) {
  const date = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    throw new Error(`${file}: ${field} 는 YYYY-MM-DD 형식이어야 합니다 (현재: ${date})`);
  }
  return date;
}

function readPost(path, file, projectIds) {
  const src = readFileSync(path, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const match = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: 파일 맨 위에 --- 로 감싼 Front Matter가 필요합니다`);
  const meta = parseYaml(match[1]) || {};
  for (const key of ['title', 'description', 'date', 'category']) {
    if (!meta[key]) throw new Error(`${file}: 필수 항목 ${key} 가 없습니다`);
  }
  const slug = basename(path, '.md');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error(`${file}: 파일명은 영문 소문자·숫자·하이픈만 사용합니다 (URL이 됩니다)`);
  const projects = [].concat(meta.projects || []).map(String);
  const unknown = projects.find((id) => !projectIds.has(id));
  if (unknown) throw new Error(`${file}: data/projects.json 에 없는 프로젝트 id: ${unknown}`);

  const body = match[2];
  const text = body.replace(/[#*`>|~[\]()!]/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    slug,
    url: `/blog/${slug}/`,
    title: String(meta.title),
    description: String(meta.description),
    date: normalizeDate(meta.date, file, 'date'),
    updated: meta.updated ? normalizeDate(meta.updated, file, 'updated') : null,
    category: String(meta.category),
    tags: [].concat(meta.tags || []).map(String),
    projects,
    // 따옴표로 쓴 "true" 도 초안으로 취급해 실수로 공개되지 않게 합니다.
    draft: String(meta.draft).toLowerCase() === 'true',
    minutes: Math.max(1, Math.ceil(text.length / 500)),
    text,
    ...renderMarkdown(body),
  };
}

function loadPosts(contentDir, projectIds, includeDrafts) {
  const files = existsSync(contentDir) ? readdirSync(contentDir, { recursive: true }).map(String) : [];
  const posts = files
    .filter((f) => f.endsWith('.md') && !basename(f).startsWith('_'))
    .map((f) => readPost(join(contentDir, f), f.split(sep).join('/'), projectIds));
  const seen = new Set();
  for (const p of posts) {
    if (seen.has(p.slug)) throw new Error(`게시글 파일명이 중복됩니다: ${p.slug}.md`);
    seen.add(p.slug);
  }
  return posts
    .filter((p) => includeDrafts || !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

function layout(site, { title, description, path, type = 'website', extraHead = '', content, wide = false }) {
  const url = SITE_URL + path;
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#2F5D50">
  <link rel="canonical" href="${esc(url)}">
  <link rel="alternate" type="application/rss+xml" title="${esc(site.name)} 기술 블로그" href="/feed.xml">

  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${esc(site.name)} 포트폴리오">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${SITE_URL}/assets/images/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
${extraHead}
  <link rel="icon" href="/assets/images/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="stylesheet" href="/assets/css/blog.css">
  <script src="/assets/js/blog.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#app">본문으로 건너뛰기</a>
  <header class="site-header">
    <div class="container nav${wide ? ' wide' : ''}">
      <a class="brand" href="/">홈</a>
      <nav class="nav-links" aria-label="주요 메뉴">
        <a href="/projects.html">프로젝트</a>
        <a href="/resume.html">이력서</a>
        <a href="/resume.html#career-detail">경력기술서</a>
        <a href="/blog/" aria-current="page">Blog</a>
      </nav>
    </div>
  </header>

  <main id="app" class="container ${wide ? 'wide' : 'narrow'}">
${content}
  </main>

  <footer class="site-footer">
    <div class="container ${wide ? 'wide' : 'narrow'}">© ${new Date().getFullYear()} ${esc(site.name)} · <a href="/feed.xml">RSS</a></div>
  </footer>
</body>
</html>
`;
}

function postMeta(p) {
  return [
    `<time datetime="${p.date}">${dot(p.date)}</time>`,
    p.updated && p.updated !== p.date ? `수정 <time datetime="${p.updated}">${dot(p.updated)}</time>` : '',
    `약 ${p.minutes}분`,
  ].filter(Boolean).join(' · ');
}

function chips(filter, counts) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, n]) => `<button type="button" class="chip" data-filter="${filter}" data-value="${esc(value)}" aria-pressed="false">${esc(value)} <span>${n}</span></button>`)
    .join('\n          ');
}

function countBy(values) {
  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  return counts;
}

function listPage(site, posts) {
  const description = `${site.name}의 기술 블로그 — 개발 과정의 학습 기록과 문제 해결 경험을 정리합니다.`;
  const cards = posts.map((p) => `      <li>
        <article class="card post-card" data-slug="${esc(p.slug)}" data-category="${esc(p.category)}" data-tags="${esc(JSON.stringify(p.tags))}">
          <div class="card-body">
            <span class="meta"><strong>${esc(p.category)}</strong> · ${postMeta(p)}</span>
            <h2><a href="${p.url}">${esc(p.title)}</a></h2>
            <p>${esc(p.description)}</p>
            ${p.tags.length ? `<ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
          </div>
        </article>
      </li>`).join('\n');
  const finder = `    <div class="blog-finder" id="blog-finder" hidden>
      <input type="search" id="blog-search" placeholder="제목, 본문, 태그 검색" aria-label="게시글 검색">
      <div class="chip-row" role="group" aria-label="카테고리">
        <button type="button" class="chip" data-filter="category" data-value="" aria-pressed="true">전체 <span>${posts.length}</span></button>
          ${chips('category', countBy(posts.map((p) => p.category)))}
      </div>
      <div class="chip-row" role="group" aria-label="태그">
          ${chips('tag', countBy(posts.flatMap((p) => p.tags)))}
      </div>
    </div>
    <p class="result-count" id="blog-count" aria-live="polite">글 ${posts.length}개</p>`;
  const content = `    <header class="p-head blog-head">
      <h1>Blog</h1>
      <p class="subtitle">개발 과정의 학습 기록과 문제 해결 경험을 정리합니다.</p>
    </header>
${posts.length ? `${finder}
    <ul class="post-list" id="post-list">
${cards}
    </ul>
    <p class="empty-note" id="blog-empty" hidden>조건에 맞는 글이 없습니다. <a href="/blog/">필터 초기화</a></p>`
    : '    <p class="empty-note">아직 공개된 글이 없습니다. 곧 첫 글로 찾아오겠습니다.</p>'}`;
  return layout(site, { title: `Blog | ${site.name} 기술 블로그`, description, path: '/blog/', content });
}

function postPage(site, post, newer, older) {
  const pager = (p, dir, cls) => `<a class="${cls}" href="${p.url}"><span class="dir">${dir}</span><span class="name">${esc(p.title)}</span></a>`;
  const toc = post.toc.length ? `      <nav class="toc" aria-label="목차">
        <details id="toc">
          <summary>목차</summary>
          <ol>
${post.toc.map((h) => `            <li class="toc-${h.depth}"><a href="#${esc(h.id)}">${h.text}</a></li>`).join('\n')}
          </ol>
        </details>
      </nav>` : '';
  const related = post.projects.map((id) => `<li><a href="/project.html?id=${encodeURIComponent(id)}">${esc(site.projects.get(id))}</a></li>`).join('');
  const content = `    <a class="back-link" href="/blog/">← 글 목록</a>
    <header class="p-head">
      <p class="meta"><a href="/blog/?category=${encodeURIComponent(post.category)}">${esc(post.category)}</a> · ${postMeta(post)}</p>
      <h1>${esc(post.title)}</h1>
      <p class="subtitle">${esc(post.description)}</p>
      ${post.tags.length ? `<ul class="tags">${post.tags.map((t) => `<li><a href="/blog/?tag=${encodeURIComponent(t)}">${esc(t)}</a></li>`).join('')}</ul>` : ''}
    </header>
    <div class="post-layout">
${toc}
      <article class="post-body">
${post.html}
${related ? `        <aside class="related-projects"><h2>관련 프로젝트</h2><ul>${related}</ul></aside>` : ''}
      </article>
    </div>
    ${newer || older ? `<nav class="pager" aria-label="이전/다음 글">
      ${older ? pager(older, '← 이전 글', 'prev') : ''}
      ${newer ? pager(newer, '다음 글 →', 'next') : ''}
    </nav>` : ''}`;
  const extraHead = [
    `  <meta property="article:published_time" content="${post.date}">`,
    post.updated ? `  <meta property="article:modified_time" content="${post.updated}">` : '',
    `  <meta property="article:section" content="${esc(post.category)}">`,
    ...post.tags.map((t) => `  <meta property="article:tag" content="${esc(t)}">`),
  ].filter(Boolean).join('\n');
  return layout(site, { title: `${post.title} | ${site.name} 기술 블로그`, description: post.description, path: post.url, type: 'article', extraHead, content, wide: true });
}

function sitemap(site, posts) {
  const urls = [
    { path: '/' },
    { path: '/resume.html' },
    { path: '/projects.html' },
    ...[...site.projects.keys()].map((id) => ({ path: `/project.html?id=${encodeURIComponent(id)}` })),
    { path: '/blog/', lastmod: posts[0]?.updated || posts[0]?.date },
    ...posts.map((p) => ({ path: p.url, lastmod: p.updated || p.date })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(SITE_URL + u.path)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
}

function feed(site, posts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(site.name)} 기술 블로그</title>
    <link>${SITE_URL}/blog/</link>
    <description>개발 과정의 학습 기록과 문제 해결 경험</description>
    <language>ko</language>
${posts.map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE_URL}${p.url}</link>
      <guid>${SITE_URL}${p.url}</guid>
      <pubDate>${new Date(`${p.date}T00:00:00+09:00`).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
      <category>${esc(p.category)}</category>
    </item>`).join('\n')}
  </channel>
</rss>
`;
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

export function build({ out = join(ROOT, '_site'), contentDir = join(ROOT, 'content', 'blog'), drafts = false } = {}) {
  const name = JSON.parse(readFileSync(join(ROOT, 'data', 'resume.json'), 'utf8')).profile.name;
  const projectList = JSON.parse(readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8'));
  const site = { name, projects: new Map(projectList.map((p) => [p.id, p.title])) };
  // 잘못된 글이 있으면 여기서 실패해, 배포 전에 이전 사이트가 유지됩니다.
  const posts = loadPosts(contentDir, site.projects, drafts);

  // 먼저 지우지 않고 덮어씁니다. 외장 드라이브 등에서는 방금 지운 폴더가 잠시 접근 거부 상태로 남습니다.
  // ponytail: 로컬 _site 에는 지운 이미지가 남을 수 있음. CI는 매번 새로 받으므로 배포에는 영향 없음.
  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(ROOT)) {
    if (f.endsWith('.html')) cpSync(join(ROOT, f), join(out, f));
  }
  cpSync(join(ROOT, 'assets'), join(out, 'assets'), { recursive: true });
  cpSync(join(ROOT, 'data'), join(out, 'data'), { recursive: true, filter: (src) => basename(src) !== 'private.json' });

  write(join(out, 'blog', 'index.html'), listPage(site, posts));
  posts.forEach((p, i) => write(join(out, 'blog', p.slug, 'index.html'), postPage(site, p, posts[i - 1], posts[i + 1])));
  write(join(out, 'blog', 'search.json'), JSON.stringify(Object.fromEntries(posts.map((p) => [p.slug, p.text.toLowerCase()]))));
  // 삭제했거나 초안으로 되돌린 글의 이전 결과물 정리
  const current = new Set(['index.html', 'search.json', ...posts.map((p) => p.slug)]);
  for (const f of readdirSync(join(out, 'blog'))) {
    if (current.has(f)) continue;
    try {
      rmSync(join(out, 'blog', f), { recursive: true, force: true, maxRetries: 5 });
    } catch (err) {
      // CI는 빈 폴더에서 시작하므로 이 경고는 로컬 _site 에서만 발생합니다. 목록·색인에는 이미 빠져 있습니다.
      console.warn(`경고: 이전 결과물 blog/${f} 를 지우지 못했습니다 (${err.code}). 직접 URL로는 로컬에서 계속 열립니다.`);
    }
  }

  const related = {};
  for (const p of posts) {
    for (const id of p.projects) (related[id] ||= []).push({ title: p.title, url: p.url, date: dot(p.date) });
  }
  write(join(out, 'data', 'related-posts.json'), JSON.stringify(related));
  write(join(out, 'data', 'recent-posts.json'), JSON.stringify(posts.slice(0, 5).map((p) => ({
    title: p.title, url: p.url, date: dot(p.date), category: p.category, description: p.description, minutes: p.minutes,
  }))));
  write(join(out, 'sitemap.xml'), sitemap(site, posts));
  write(join(out, 'feed.xml'), feed(site, posts));
  write(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  return posts;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const drafts = process.argv.includes('--drafts');
    const posts = build({ drafts });
    console.log(`빌드 완료: 글 ${posts.length}개${drafts ? ' (초안 포함)' : ''} → _site/`);
  } catch (err) {
    console.error(`빌드 실패: ${err.message}`);
    process.exit(1);
  }
}
