import { Hono } from 'hono'
import type { Context } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { deleteCookie, getCookie, getSignedCookie, setCookie, setSignedCookie } from 'hono/cookie'
import { sights } from '../../src/data'

type Bindings = {
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  SESSION_SECRET: string
}

type User = { sub: string; name: string; email: string; picture: string }

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
const redirectUri = (c: Context) => `${new URL(c.req.url).origin}/api/auth/callback`

// ---- 기본 API ----
app.get('/health', (c) => c.json({ ok: true }))
app.get('/sights', (c) => c.json(sights))

// ---- Google 로그인 ----

// 1) Google 로그인 화면으로 보내기
app.get('/auth/google', (c) => {
  if (!c.env.GOOGLE_CLIENT_ID) return c.text('GOOGLE_CLIENT_ID가 설정되지 않았습니다.', 500)

  const state = crypto.randomUUID()
  setCookie(c, STATE_COOKIE, state, {
    httpOnly: true,
    secure: isHttps(c),
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: 600,
  })

  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(c),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  })
  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

// 2) Google이 돌려보낸 code로 사용자 정보 받기
app.get('/auth/callback', async (c) => {
  const { code, state, error } = c.req.query()
  if (error) return c.redirect(`/?login_error=${encodeURIComponent(error)}`)

  const savedState = getCookie(c, STATE_COOKIE)
  deleteCookie(c, STATE_COOKIE, { path: '/api/auth' })
  if (!code || !state || state !== savedState) return c.text('잘못된 로그인 요청입니다 (state 불일치).', 400)

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri(c),
      grant_type: 'authorization_code',
    }),
  })
  if (!tokenRes.ok) return c.text(`토큰 교환 실패: ${await tokenRes.text()}`, 502)
  const { access_token } = (await tokenRes.json()) as { access_token: string }

  const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!infoRes.ok) return c.text('사용자 정보를 가져오지 못했습니다.', 502)
  const info = (await infoRes.json()) as User

  const user: User = { sub: info.sub, name: info.name, email: info.email, picture: info.picture }
  await setSignedCookie(c, SESSION_COOKIE, toBase64Url(JSON.stringify(user)), c.env.SESSION_SECRET, {
    httpOnly: true,
    secure: isHttps(c),
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return c.redirect('/')
})

// 3) 현재 로그인한 사용자
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

// 4) 로그아웃
app.post('/auth/logout', (c) => {
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.json({ ok: true })
})

export const onRequest = handle(app)
