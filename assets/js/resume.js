'use strict';

/**
 * 이력서 페이지 = [이력서(요약)] + [경력기술서(상세)]
 * 인쇄: 전체 / 이력서만 / 경력기술서만 (URL ?print=all|resume|career 로도 바로 인쇄)
 */
(async () => {
  const { h, isEmpty, clean } = App;
  const root = document.getElementById('app');
  const PARTS = {
    all: '이력서·경력기술서',
    resume: '이력서',
    career: '경력기술서',
  };

  try {
    const [resume, projects] = await Promise.all([App.loadJSON('resume'), App.loadJSON('projects')]);
    const profile = await App.loadProfile(resume);
    App.bindProfile(profile);
    // 인쇄 시 PDF 기본 파일명이 됩니다.
    const baseTitle = `${profile.name} ${PARTS.all}`;
    document.title = baseTitle;

    const experiences = clean(resume.experience);

    App.render(root, [
      h('div', { class: 'part part-resume' },
        renderHead(profile),
        section('소개', (profile.intro || profile.summary) && App.paragraphs(profile.intro || profile.summary)),
        section('핵심 성과', list(resume.achievements)),
        section('핵심역량', strengthList(resume.strengths)),
        section('경력', experiences.map(experienceSummary)),
        resume.workstyle && section(resume.workstyle.title || '업무 방식', !isEmpty(resume.workstyle.text) && App.paragraphs(resume.workstyle.text)),
        section('학력', clean(resume.education).map((e) =>
          entry(e.period, e.school, e.major))),
        section('교육 이수', clean(resume.training).map((t) =>
          entry(t.period, t.course, [t.org, t.desc].filter((v) => !isEmpty(v)).join(' · ')))),
        section('프로젝트', clean(projects).filter((p) => p.resume !== false).map(project)),
        section('기술 스택', clean(resume.skills).map((s) =>
          h('div', { class: 'skill-row' }, h('h3', {}, s.category), h('div', {}, clean(s.items).join(', '))))),
        section('자격증', table(clean(resume.certifications).map((c) => [c.name, c.issuer, c.date]))),
        section('수상', table(clean(resume.awards).map((a) => [`${a.title}${a.prize ? ` — ${a.prize}` : ''}`, a.org, a.date]))),
      ),
      h('div', { class: 'part part-career', id: 'career-detail' },
        h('header', { class: 'career-head' },
          h('h1', {}, '경력기술서'),
          h('p', { class: 'sub' }, [profile.name, profile.title].filter(Boolean).join(' · ')),
        ),
        experiences.map((e) => h('section', { class: 'r-section' }, h('h2', {}, `${e.org}`), experienceDetail(e))),
      ),
    ]);

    // 인쇄 대상 부분을 body에 표시 → CSS가 나머지를 숨김
    const printPart = (part) => {
      document.body.dataset.printPart = part;
      document.title = `${profile.name} ${PARTS[part]}`;
      window.print();
    };
    window.addEventListener('afterprint', () => {
      delete document.body.dataset.printPart;
      document.title = baseTitle;
    });
    root.querySelectorAll('[data-print]').forEach((btn) =>
      btn.addEventListener('click', () => printPart(btn.dataset.print)));

    // 내용이 JS로 그려진 뒤라 브라우저 기본 앵커 이동이 안 되므로 직접 이동 (#career-detail 등)
    // 긴 거리를 부드럽게 스크롤하면 느리므로 처음 열 때는 즉시 이동
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'instant' });

    const param = new URLSearchParams(location.search).get('print');
    if (param) {
      if (document.fonts) await document.fonts.ready;
      setTimeout(() => printPart(PARTS[param] ? param : 'all'), 150);
    }
  } catch (err) {
    App.showError(root, err);
  }

  function renderHead(p) {
    const photo = isEmpty(p.photo) ? null : h('img', { class: 'resume-photo', src: p.photo, alt: `${p.name} 사진`, width: 104, height: 136 });
    return h('header', { class: 'resume-head' },
      h('div', {},
        h('h1', {}, p.name),
        p.title && h('p', { class: 'title' }, p.title),
        p.tagline && h('p', { class: 'tagline' }, p.tagline),
        App.contacts(p),
        h('div', { class: 'actions no-print' },
          h('button', { class: 'btn btn-primary', type: 'button', 'data-print': 'all' }, '전체 PDF'),
          h('button', { class: 'btn btn-ghost', type: 'button', 'data-print': 'resume' }, '이력서만'),
          h('button', { class: 'btn btn-ghost', type: 'button', 'data-print': 'career' }, '경력기술서만'),
          isEmpty(p.resumePdf) ? null : App.pdfLink(p),
        ),
      ),
      photo,
    );
  }

  /** 내용이 비어 있으면 섹션 자체를 생략 */
  function section(title, content) {
    if (isEmpty(content)) return null;
    return h('section', { class: 'r-section' }, h('h2', {}, title), content);
  }

  function entry(when, title, sub, ...body) {
    return h('div', { class: 'entry' },
      h('div', { class: 'when' }, when || ''),
      h('div', {}, h('h3', {}, title), sub && h('p', { class: 'sub' }, sub), body),
    );
  }

  function list(items) {
    const xs = clean(items);
    return xs.length ? h('ul', {}, xs.map((x) => h('li', {}, x))) : null;
  }

  function strengthList(strengths) {
    const xs = clean(strengths);
    return xs.length ? h('ul', { class: 'strength-list' }, xs.map((s) => h('li', {}, h('b', {}, s.title), s.desc ? ` — ${s.desc}` : ''))) : null;
  }

  function techLine(tech) {
    const xs = clean(tech);
    return xs.length ? h('p', { class: 'tech-line' }, h('b', {}, 'Tech'), xs.join(', ')) : null;
  }

  /** 이력서용: 회사·기간·직무 + 요약 3~4줄 */
  function experienceSummary(e) {
    return entry(e.period, e.org, e.role, list(clean(e.summary).length ? e.summary : clean(e.tasks).slice(0, 4)));
  }

  /** 경력기술서용: 주요 담당 업무 + 문제 해결 경험 전체 */
  function experienceDetail(e) {
    const el = entry(e.period, e.role, null,
      clean(e.tasks).length ? [h('p', { class: 'label' }, '주요 담당 업무'), list(e.tasks)] : null,
      clean(e.highlights).length ? h('p', { class: 'label' }, '주요 문제 해결 및 개발 경험') : null,
      clean(e.highlights).map((hl, i) => h('div', { class: 'highlight' },
        h('h4', {}, `${i + 1}. ${hl.title}`), list(hl.items), techLine(hl.tech))),
      techLine(e.tech),
    );
    el.classList.add('long');
    return el;
  }

  function project(p) {
    const sub = [p.subtitle, p.team].filter((v) => !isEmpty(v)).join(' · ');
    const title = h('a', { href: App.projectUrl(p.id) }, p.title);
    return entry(p.period, title, sub, list(clean(p.role).slice(0, 2)), techLine(p.tech));
  }

  function table(rows) {
    if (!rows.length) return null;
    return h('table', { class: 'r-table' }, h('tbody', {}, rows.map(([a, b, c]) =>
      h('tr', {}, h('td', {}, a), h('td', { class: 'muted' }, b || ''), h('td', { class: 'date' }, c || '')))));
  }
})();
