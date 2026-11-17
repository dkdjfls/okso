import { Hono } from 'hono'
import type { Context } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { deleteCookie, getCookie, getSignedCookie, setCookie, setSignedCookie } from 'hono/cookie'
import { GOOGLE_CLIENT_ID, NAVER_CLIENT_ID } from '../../src/config'
import { sights } from '../../src/data'

type Bindings = {
  SESSION_SECRET: string
  NAVER_CLIENT_SECRET: string
}

type Provider = 'google' | 'naver'
type User = { sub: string; name: string; email: string; picture: string; provider: Provider }
type Ctx = Context<{ Bindings: Bindings }>

const SESSION_COOKIE = 'session'
const STATE_COOKIE = 'oauth_state'
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

const setSession = (c: Ctx, user: User) =>
  setSignedCookie(c, SESSION_COOKIE, toBase64Url(JSON.stringify(user)), c.env.SESSION_SECRET, {
    httpOnly: true,
    secure: isHttps(c),
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })

// 로그인 실패 시 메인으로 돌려보내며 화면에 오류를 표시
const failRedirect = (c: Ctx, message: string) => c.redirect(`/?login_error=${encodeURIComponent(message)}`)

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

  const user: User = { sub: `google:${info.sub}`, name: info.name, email: info.email, picture: info.picture, provider: 'google' }
  await setSession(c, user)
  return c.json({ user })
})

// ---- 네이버 로그인 (콜백 URL 방식) ----
const naverCallbackUrl = (c: Ctx) => `${new URL(c.req.url).origin}/api/auth/naver/callback`

// 1) 네이버 로그인 화면으로 보내기
app.get('/auth/naver', (c) => {
  if (!NAVER_CLIENT_ID) return failRedirect(c, '네이버 Client ID가 설정되지 않았습니다.')

  const state = crypto.randomUUID()
  setCookie(c, STATE_COOKIE, state, {
    httpOnly: true,
    secure: isHttps(c),
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: 600,
  })

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: NAVER_CLIENT_ID,
    redirect_uri: naverCallbackUrl(c),
    state,
  })
  return c.redirect(`https://nid.naver.com/oauth2.0/authorize?${params}`)
})

// 2) 네이버가 돌려보낸 code로 토큰 → 프로필 받기
app.get('/auth/naver/callback', async (c) => {
  const { code, state, error, error_description } = c.req.query()
  if (error) return failRedirect(c, `네이버 로그인 취소/실패: ${error_description ?? error}`)

  const savedState = getCookie(c, STATE_COOKIE)
  deleteCookie(c, STATE_COOKIE, { path: '/api/auth' })
  if (!code || !state || state !== savedState) return failRedirect(c, '잘못된 로그인 요청입니다 (state 불일치).')

  if (!c.env.NAVER_CLIENT_SECRET) return failRedirect(c, '서버에 NAVER_CLIENT_SECRET이 설정되지 않았습니다.')
  if (!c.env.SESSION_SECRET) return failRedirect(c, '서버에 SESSION_SECRET이 설정되지 않았습니다.')

  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: NAVER_CLIENT_ID,
    client_secret: c.env.NAVER_CLIENT_SECRET,
    code,
    state,
  })
  const tokenRes = await fetch(`https://nid.naver.com/oauth2.0/token?${tokenParams}`)
  const token = (await tokenRes.json().catch(() => ({}))) as {
    access_token?: string
    error?: string
    error_description?: string
  }
  if (!token.access_token) return failRedirect(c, `네이버 토큰 발급 실패: ${token.error_description ?? token.error ?? tokenRes.status}`)

  const meRes = await fetch('https://openapi.naver.com/v1/nid/me', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  const me = (await meRes.json().catch(() => ({}))) as {
    resultcode?: string
    message?: string
    response?: { id: string; name?: string; nickname?: string; email?: string; profile_image?: string }
  }
  if (me.resultcode !== '00' || !me.response) return failRedirect(c, `네이버 프로필 조회 실패: ${me.message ?? meRes.status}`)

  const p = me.response
  const user: User = {
    sub: `naver:${p.id}`,
    name: p.name || p.nickname || '네이버 사용자',
    email: p.email ?? '',
    picture: p.profile_image ?? '',
    provider: 'naver',
  }
  await setSession(c, user)
  return c.redirect('/')
})

// ---- 공통 ----

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
