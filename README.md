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
| `POST /api/auth/google` | Google ID 토큰(credential) 검증 후 로그인 |
| `GET /api/me` | 현재 로그인 사용자 (`{ user }`) |
| `GET /api/auth/naver` | 네이버 로그인 시작 |
| `GET /api/auth/naver/callback` | 네이버 로그인 콜백 |
| `POST /api/auth/logout` | 로그아웃 |

## Google 로그인 설정 (연습용)

Google Identity Services("Google 계정으로 로그인" 버튼) 방식이라 **리디렉션 URI와 Client Secret이 필요 없습니다.**

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth 클라이언트(Web application)
2. **승인된 자바스크립트 원본**에 추가:
   - `https://okso-1xy.pages.dev`
   - `http://localhost:8788`, `http://localhost` (로컬 테스트용)
3. OAuth consent screen이 Testing 상태라면 **Test users**에 로그인할 계정을 추가합니다.
4. 클라이언트 ID는 `src/config.ts`에 있습니다.
5. 세션 쿠키 서명용 `SESSION_SECRET`(긴 무작위 문자열)을 설정합니다.
   - 배포: Cloudflare 대시보드 → 프로젝트 → Settings → Variables and Secrets (Secret)
   - 로컬: `.dev.vars.example`을 `.dev.vars`로 복사 후 `npm run preview`

## 네이버 로그인 설정

1. [네이버 개발자센터](https://developers.naver.com/apps/) → 애플리케이션 등록 → 사용 API: **네이버 로그인**
2. 로그인 오픈 API 서비스 환경: **PC 웹**
   - 서비스 URL: `https://okso-1xy.pages.dev`
   - Callback URL: `https://okso-1xy.pages.dev/api/auth/naver/callback`, `http://localhost:8788/api/auth/naver/callback`
3. Client ID → `src/config.ts`의 `NAVER_CLIENT_ID`
4. Client Secret → Cloudflare Secret `NAVER_CLIENT_SECRET` (로컬은 `.dev.vars`)
5. 애플리케이션이 "개발 중" 상태면 **멤버관리**에 등록한 네이버 아이디만 로그인할 수 있습니다.

## Cloudflare Pages 설정

- Framework preset: None (또는 Vite)
- Build command: `npm run build`
- Build output directory: `dist`
