# 사이트 관리 가이드

이 문서는 사이트 내용을 수정하고 배포하는 방법을 정리한 관리용 문서입니다.
빌드 과정 없이 순수 HTML/CSS/JavaScript로 동작하며, 내용은 `data/*.json` 만 수정하면 됩니다.

---

## 폴더 구조

```
jin123346.github.io/
├── index.html            # 메인: 짧은 소개 + 프로젝트 카드
├── resume.html           # 이력서 + 경력기술서 (인쇄용)
├── project.html          # 프로젝트 상세 (?id=...)
├── 404.html
├── data/
│   ├── resume.json       # 프로필, 성과, 역량, 경력, 학력, 교육, 기술, 자격증, 수상
│   ├── projects.json     # 프로젝트 목록 (배열 순서 = 화면 순서)
│   └── private.json      # 비공개 정보 (.gitignore — GitHub에 올라가지 않음)
├── assets/
│   ├── css/style.css     # 디자인 (포인트 컬러: --accent)
│   ├── js/               # common.js(공통) + main / resume / project.js
│   ├── images/           # favicon, og-image, profile, 프로젝트 이미지
│   └── files/            # 발표자료·보고서 PDF
├── docs/GUIDE.md         # 이 문서
└── .nojekyll
```

---

## 콘텐츠 수정

값이 빈 문자열 `""` 이거나 빈 배열 `[]` 이면 해당 항목·섹션은 화면에서 자동으로 숨겨집니다.

> JSON은 문법에 엄격합니다. 마지막 항목 뒤 쉼표 금지, 문자열은 큰따옴표 `"` 만 사용.
> 화면에 "콘텐츠를 불러오지 못했습니다"가 뜨면 대부분 쉼표·따옴표 문제입니다.

### `data/resume.json`

| 키 | 표시 위치 | 설명 |
| --- | --- | --- |
| `profile.name / title / tagline` | 메인·이력서 | 이름, 직무, 한 줄 소개 |
| `profile.summary` | 메인 첫 화면 | 짧은 소개 (2~3문장) |
| `profile.intro` | 이력서 "소개" | 자기소개 전문. 빈 줄(`\n\n`)로 문단 구분 |
| `profile.email` / `links` / `photo` | 메인·이력서 | 연락처, 링크, 사진 경로 |
| `profile.phone` | — | **비워 두고 `private.json` 에 넣기** (아래 참고) |
| `profile.resumePdf` | 메인 버튼 | PDF 파일 경로. 비우면 이력서 페이지를 열고 인쇄 창을 띄움 |
| `achievements` | 이력서 | 핵심 성과 목록 |
| `strengths` | 이력서 | 핵심역량 `[{ "title", "desc" }]` |
| `workstyle` | 이력서 | 업무 방식 및 협업 `{ "title", "text" }` |
| `experience[].summary` | 이력서 "경력" | 회사별 요약 3~4줄 |
| `experience[].tasks` / `highlights` | 경력기술서 | 주요 담당 업무 / 문제 해결 경험 `[{ "title", "items": [], "tech": [] }]` |
| `education` / `training` / `skills` / `certifications` / `awards` | 이력서 | 학력, 교육 이수, 기술 스택, 자격증, 수상 |

### `data/projects.json`

```jsonc
{
  "id": "bioflow",            // 영문 소문자·하이픈. 상세 주소가 project.html?id=bioflow
  "featured": true,           // 메인 카드에 노출 여부
  "category": "work",         // 메인 묶음: work(실무) · personal(개인) · team(팀). 없으면 "기타"
  "org": "국립중앙과학관",     // (work 일 때) 묶음 제목 "실무 · 국립중앙과학관"
  "resume": false,            // (선택) 이력서 프로젝트 목록에서 제외 — 경력 항목과 겹칠 때
  "title": "BioFlow",
  "subtitle": "한 줄 설명",
  "period": "2025.08 ~ 2025.10",
  "team": "1인 개발",
  "thumbnail": "assets/images/projects/bioflow/cover.png",  // 비우면 제목으로 된 기본 썸네일
  "tags": ["Python", "PySide6"],
  "problem": "문제 정의. 빈 줄(\n\n)로 문단 구분",
  "role": ["내 역할 1", "내 역할 2"],
  "solution": [
    "간단한 해결 방법은 문자열로",
    { "title": "소제목", "text": "설명", "items": ["세부 항목"], "code": "코드 예시",
      "image": { "src": "...", "alt": "...", "caption": "..." } }
  ],
  "resultsTitle": "결과",     // (선택) 진행 중이면 "현재 진행 상황" 등
  "results": [
    { "value": "52.4s → 7.8s", "label": "조회시간" },   // 수치 → 강조 카드
    "문장형 결과"                                       // 문자열 → 목록
  ],
  "tech": ["Python", "Pandas"],
  "images": [{ "src": "...", "alt": "...", "caption": "..." }],   // .mp4/.webm 은 동영상으로 표시
  "links": [{ "label": "GitHub", "url": "https://github.com/..." }]
}
```

- 배열 순서가 화면 순서이고, 상세 페이지의 이전/다음 이동도 이 순서를 따릅니다.
- 이미지는 `assets/images/projects/<id>/` 에 넣습니다. 썸네일은 16:9, 1MB 이하 권장.

### 비공개 정보 — `data/private.json`

`.gitignore` 에 등록되어 있어 GitHub에 올라가지 않습니다. 로컬 서버에서 볼 때만 `resume.json` 의 `profile` 위에 덮어써집니다.

```json
{ "profile": { "phone": "010-0000-0000" } }
```

- 로컬에서 인쇄 → 전화번호가 들어간 제출용 PDF
- 공개 사이트 → 전화번호 없음
- 생년월일·주소는 어디에도 넣지 않습니다. JSON은 `/data/resume.json` 주소로 누구나 열어볼 수 있습니다.
- `git status` 에 `data/private.json` 이 보이면 안 됩니다.

### 공유 미리보기 문구 (HTML `<head>`)

카카오톡·슬랙 등의 링크 미리보기는 JavaScript를 실행하지 않으므로, 각 HTML `<head>` 의 `title`, `description`, `og:*` 는 직접 적혀 있습니다.
이름이나 한 줄 소개를 바꾸면 `index.html`, `resume.html`, `project.html` 의 `<head>` 도 함께 고칩니다.
미리보기 이미지는 `assets/images/og-image.png` (1200×630).

---

## 로컬 확인과 PDF 만들기

`index.html` 을 더블클릭(file://)으로 열면 JSON을 읽지 못하므로 로컬 서버로 엽니다.

```bash
python -m http.server 8000 --directory C:\jin123346.github.io
```

`http://localhost:8000` 접속 후 이력서 페이지의 버튼으로 PDF를 만듭니다.

| 버튼 | 바로 인쇄 주소 | 결과 |
| --- | --- | --- |
| 전체 PDF | `resume.html?print=all` | 이력서 + 경력기술서 |
| 이력서만 | `resume.html?print=resume` | 이력서 |
| 경력기술서만 | `resume.html?print=career` | 경력기술서 |

인쇄 설정: 대상 "PDF로 저장", 용지 A4, 여백 기본값, **배경 그래픽 체크**, 머리글/바닥글 해제.

---

## 배포

JSON이나 이미지를 고친 뒤 push 하면 1~2분 안에 `https://jin123346.github.io` 에 반영됩니다.

```bash
git add .
git commit -m "내용 수정"
git push
```

### 체크리스트
- [ ] 메인·이력서·프로젝트 상세가 모두 열리는가
- [ ] 이미지 경로의 대소문자가 실제 파일명과 같은가 (GitHub Pages는 대소문자 구분)
- [ ] `https://jin123346.github.io/data/private.json` 이 **404** 인가, 공개 사이트에 전화번호가 없는가
- [ ] 링크 미리보기 확인: https://developers.kakao.com/tool/debugger/sharing (옛 미리보기면 "캐시 초기화")
