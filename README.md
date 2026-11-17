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

## Cloudflare Pages 설정

- Framework preset: None (또는 Vite)
- Build command: `npm run build`
- Build output directory: `dist`
