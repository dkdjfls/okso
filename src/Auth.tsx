import { useEffect, useRef, useState } from 'react'
import { GOOGLE_CLIENT_ID } from './config'

type User = { sub: string; name: string; email: string; picture: string; provider?: 'google' | 'naver' }

// Google Identity Services (https://accounts.google.com/gsi/client) 최소 타입
type GoogleId = {
  initialize: (opts: { client_id: string; callback: (r: { credential: string }) => void }) => void
  renderButton: (el: HTMLElement, opts: Record<string, string | number>) => void
  disableAutoSelect: () => void
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } }
  }
}

function waitForGoogle(): Promise<GoogleId> {
  return new Promise((resolve) => {
    const check = () => (window.google?.accounts?.id ? resolve(window.google.accounts.id) : setTimeout(check, 100))
    check()
  })
}

// 서버가 로그인 실패 시 붙여 보내는 ?login_error=... 를 읽고 주소에서 지움
function takeLoginError(): string {
  const url = new URL(window.location.href)
  const msg = url.searchParams.get('login_error') ?? ''
  if (msg) {
    url.searchParams.delete('login_error')
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
  }
  return msg
}

export default function Auth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(takeLoginError)
  const buttonRef = useRef<HTMLDivElement>(null)

  // 기존 세션 확인
  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d: { user: User | null }) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  // 로그인 안 된 상태면 Google 버튼 그리기
  useEffect(() => {
    if (loading || user) return
    let cancelled = false
    waitForGoogle().then((gid) => {
      if (cancelled || !buttonRef.current) return
      gid.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          setError('')
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
          })
          const data = (await res.json().catch(() => ({}))) as { user?: User; error?: string }
          if (res.ok && data.user) setUser(data.user)
          else setError(data.error ?? '로그인에 실패했습니다.')
        },
      })
      gid.renderButton(buttonRef.current, { theme: 'outline', size: 'large', shape: 'rectangular', text: 'signin_with', locale: 'ko' })
    })
    return () => {
      cancelled = true
    }
  }, [loading, user])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.google?.accounts.id.disableAutoSelect()
    setUser(null)
  }

  if (loading) return <div className="h-11 w-28" aria-hidden="true" />

  if (!user) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div ref={buttonRef} className="min-h-10" />
          <a
            href="/api/auth/naver"
            className="inline-flex h-10 items-center gap-2 rounded bg-[#03C75A] px-4 text-sm font-bold text-white hover:bg-[#02B350]"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true">
              <path fill="#fff" d="M13.6 10.7 6.1 0H0v20h6.4V9.3L13.9 20H20V0h-6.4z" />
            </svg>
            네이버 로그인
          </a>
        </div>
        {error && (
          <p role="alert" className="max-w-[360px] text-right text-xs text-[#B42318]">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {user.picture ? (
        <img src={user.picture} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full" />
      ) : (
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
          {user.name.slice(0, 1)}
        </span>
      )}
      <div className="hidden flex-col leading-tight sm:flex">
        <span className="text-sm font-bold">
          {user.name}
          {user.provider === 'naver' && <span className="ml-1 text-xs font-medium text-[#03A94D]">· 네이버</span>}
        </span>
        <span className="text-xs text-muted">{user.email}</span>
      </div>
      <button
        type="button"
        onClick={logout}
        className="h-11 rounded-lg px-3 text-sm text-muted hover:bg-sand hover:text-ink"
      >
        로그아웃
      </button>
    </div>
  )
}
