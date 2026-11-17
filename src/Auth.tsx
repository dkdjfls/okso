import { useEffect, useRef, useState } from 'react'
import { GOOGLE_CLIENT_ID } from './config'

type User = { sub: string; name: string; email: string; picture: string }

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

export default function Auth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
        <div ref={buttonRef} className="min-h-10" />
        {error && (
          <p role="alert" className="text-xs text-[#B42318]">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <img src={user.picture} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full" />
      <div className="hidden flex-col leading-tight sm:flex">
        <span className="text-sm font-bold">{user.name}</span>
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
