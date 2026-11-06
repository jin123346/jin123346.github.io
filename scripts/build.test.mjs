import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { build } from './build.mjs';

const tmp = mkdtempSync(join(tmpdir(), 'blog-test-'));
after(() => rmSync(tmp, { recursive: true, force: true }));

let n = 0;
function site(files, options = {}) {
  const contentDir = join(tmp, `content-${n}`);
  const out = join(tmp, `out-${n++}`);
  mkdirSync(join(contentDir, 'nested'), { recursive: true });
  for (const [name, src] of Object.entries(files)) writeFileSync(join(contentDir, name), src);
  return { out, contentDir, posts: build({ contentDir, out, ...options }) };
}

const post = (title, date, extra = '') => `---\ntitle: "${title}"\ndescription: "요약 <b>"\ndate: "${date}"\ncategory: "Database"\ntags: [SQL]\n${extra}---\n\n## 같은 제목\n\n## 같은 제목\n\n\`\`\`sql\nSELECT 1;\n\`\`\`\n`;
const read = (out, ...path) => readFileSync(join(out, ...path), 'utf8');

test('글을 추가하면 목록·상세·색인·피드에 반영되고 최신순으로 정렬된다', () => {
  const { out, posts } = site({
    'older.md': post('옛 글', '2026-01-01'),
    'nested/newer.md': post('새 글', '2026-02-01').replaceAll('\n', '\r\n'),
    '_template.md': post('템플릿', '2026-03-01'),
  });
  assert.deepEqual(posts.map((p) => p.slug), ['newer', 'older']);

  const detail = read(out, 'blog', 'newer', 'index.html');
  assert.match(detail, /id="같은-제목"/);
  assert.match(detail, /id="같은-제목-1"/, '중복 제목의 앵커는 달라야 한다');
  assert.match(detail, /hljs-keyword/, '코드가 강조되어야 한다');
  assert.match(detail, /요약 &lt;b&gt;/, '메타데이터는 이스케이프되어야 한다');
  assert.match(detail, /<link rel="canonical" href="https:\/\/jin123346\.github\.io\/blog\/newer\/">/);
  assert.match(detail, /href="\/blog\/older\/"/, '이전 글 링크');

  assert.ok(read(out, 'feed.xml').includes('/blog/newer/'));
  assert.ok(read(out, 'sitemap.xml').includes('/blog/older/'));
  assert.ok(existsSync(join(out, 'resume.html')), '기존 페이지가 복사되어야 한다');
  assert.ok(!existsSync(join(out, 'data', 'private.json')), '비공개 파일은 배포되면 안 된다');
  assert.ok(!existsSync(join(out, 'blog', '_template')));
});

test('초안은 운영 빌드의 어떤 산출물에도 나타나지 않는다', () => {
  const files = {
    'public.md': post('공개 글', '2026-01-01'),
    'secret.md': post('비공개초안', '2026-01-02', 'draft: true\nprojects: [port-pulse]\n'),
    'quoted.md': post('따옴표초안', '2026-01-03', 'draft: "true"\n'),
  };
  const { out } = site(files);
  for (const path of [['blog', 'index.html'], ['blog', 'search.json'], ['feed.xml'], ['sitemap.xml'], ['data', 'related-posts.json'], ['data', 'recent-posts.json'], ['blog', 'public', 'index.html']]) {
    const content = read(out, ...path);
    assert.ok(!/비공개초안|따옴표초안|secret|quoted/.test(content), path.join('/'));
  }
  assert.ok(!existsSync(join(out, 'blog', 'secret')));

  const previewed = site(files, { drafts: true });
  assert.equal(previewed.posts.length, 3);
  assert.ok(existsSync(join(previewed.out, 'blog', 'secret')));
  build({ contentDir: previewed.contentDir, out: previewed.out });
  assert.ok(!existsSync(join(previewed.out, 'blog', 'secret')), '같은 폴더에 다시 빌드하면 초안 결과물이 사라져야 한다');
});

test('프로젝트 연결이 양방향으로 생성된다', () => {
  const { out } = site({ 'linked.md': post('연결 글', '2026-01-01', 'projects: [port-pulse]\n') });
  assert.equal(JSON.parse(read(out, 'data', 'related-posts.json'))['port-pulse'][0].url, '/blog/linked/');
  assert.match(read(out, 'blog', 'linked', 'index.html'), /project\.html\?id=port-pulse/);
});

test('잘못된 글은 빌드를 실패시켜 배포를 막는다', () => {
  assert.throws(() => site({ 'no-title.md': '---\ndate: "2026-01-01"\n---\n' }), /title/);
  assert.throws(() => site({ 'no-matter.md': '# 제목\n' }), /Front Matter/);
  assert.throws(() => site({ 'bad-date.md': post('글', '2026/01/01') }), /YYYY-MM-DD/);
  assert.throws(() => site({ 'Bad_Name.md': post('글', '2026-01-01') }), /파일명/);
  assert.throws(() => site({ 'x.md': post('글', '2026-01-01', 'projects: [nope]\n') }), /nope/);
  assert.throws(() => site({ 'dup.md': post('글', '2026-01-01'), 'nested/dup.md': post('글', '2026-01-01') }), /중복/);
});
