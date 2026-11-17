import { Hono } from 'hono'
import type { Context } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { GOOGLE_CLIENT_ID } from '../../src/config'
import { sights } from '../../src/data'

type Bindings = {
  SESSION_SECRET: string
}

type User = { sub: string; name: string; email: string; picture: string }

const SESSION_COOKIE = 'session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7일

const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

// ---- 유틸 ----
const toBase64Url = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const fromBase64Url = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)))
}

const isHttps = (c: Context) => new URL(c.req.url).protocol === 'https:'

// ---- 기본 API ----
app.get('/health', (c) => c.json({ ok: true }))
app.get('/sights', (c) => c.json(sights))

// ---- Google 로그인 (Google Identity Services, 리디렉션 URI 없음) ----
// 브라우저의 "Google 계정으로 로그인" 버튼이 받은 ID 토큰(credential)을 검증하고 세션 쿠키를 만듭니다.
app.post('/auth/google', async (c) => {
  if (!c.env.SESSION_SECRET) return c.json({ error: '서버에 SESSION_SECRET이 설정되지 않았습니다.' }, 500)

  const body = await c.req.json<{ credential?: string }>().catch(() => ({}) as { credential?: string })
  if (!body.credential) return c.json({ error: 'credential이 없습니다.' }, 400)

  // Google에 ID 토큰 검증 요청 (서명·만료 확인)
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`)
  if (!res.ok) return c.json({ error: '유효하지 않은 Google 토큰입니다.' }, 401)
  const info = (await res.json()) as Record<string, string>

  // 우리 앱(클라이언트 ID)용으로 발급된 토큰인지, 발급자가 Google인지 확인
  const validIssuer = info.iss === 'accounts.google.com' || info.iss === 'https://accounts.google.com'
  if (info.aud !== GOOGLE_CLIENT_ID || !validIssuer) return c.json({ error: '이 사이트용 토큰이 아닙니다.' }, 401)
  if (info.email_verified !== 'true') return c.json({ error: '이메일 인증이 안 된 계정입니다.' }, 401)

  const user: User = { sub: info.sub, name: info.name, email: info.email, picture: info.picture }
  await setSignedCookie(c, SESSION_COOKIE, toBase64Url(JSON.stringify(user)), c.env.SESSION_SECRET, {
    httpOnly: true,
    secure: isHttps(c),
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return c.json({ user })
})

// 현재 로그인한 사용자
app.get('/me', async (c) => {
  if (!c.env.SESSION_SECRET) return c.json({ user: null })
  const raw = await getSignedCookie(c, c.env.SESSION_SECRET, SESSION_COOKIE)
  if (!raw) return c.json({ user: null })
  try {
    return c.json({ user: JSON.parse(fromBase64Url(raw)) as User })
  } catch {
    return c.json({ user: null })
  }
})

// 로그아웃
app.post('/auth/logout', (c) => {
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.json({ ok: true })
})

export const onRequest = handle(app)
