# okso — 옥천 소개 사이트

시가 흐르는 호수의 고장, 충청북도 옥천을 소개하는 웹사이트입니다.

## 기술 스택

- React + Vite + TypeScript
- Tailwind CSS v4
- Hono (Cloudflare Pages Functions, `functions/api/[[route]].ts`)
- Cloudflare Pages 배포

## 시작하기

```bash
npm install
npm run dev        # 프론트엔드 개발 서버 (http://localhost:5173)
npm run preview    # 빌드 후 wrangler로 API까지 함께 로컬 실행
```

## API

| 경로 | 설명 |
|---|---|
| `GET /api/health` | 상태 확인 |
| `GET /api/sights` | 명소 목록 |

| `GET /api/auth/google` | Google 로그인 시작 |
| `GET /api/auth/callback` | Google 로그인 콜백 |
| `GET /api/me` | 현재 로그인 사용자 (`{ user }`) |
| `POST /api/auth/logout` | 로그아웃 |

## Google 로그인 설정 (연습용)

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트를 만듭니다.
2. **APIs & Services → OAuth consent screen**: User type `External`, 앱 이름·이메일 입력, 게시 상태는 `Testing`으로 두고 **Test users**에 로그인할 Google 계정을 추가합니다.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: `Web application`
   - Authorized redirect URIs:
     - `https://okso-1xy.pages.dev/api/auth/callback`
     - `http://localhost:8788/api/auth/callback` (로컬 테스트용)
4. 발급된 Client ID / Client secret을 아래 환경 변수로 넣습니다.

| 변수 | 값 |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | OAuth 클라이언트 보안 비밀번호 |
| `SESSION_SECRET` | 긴 무작위 문자열 (세션 쿠키 서명용) |

- **배포 환경**: Cloudflare 대시보드 → 프로젝트 → Settings → Variables and Secrets 에 추가(Secret 타입 권장) 후 재배포
- **로컬**: `.dev.vars.example`을 `.dev.vars`로 복사해 값을 채우고 `npm run preview` (http://localhost:8788)

## Cloudflare Pages 설정

- Framework preset: None (또는 Vite)
- Build command: `npm run build`
- Build output directory: `dist`
