import { useEffect, useState } from 'react'

type User = { sub: string; name: string; email: string; picture: string }

export default function Auth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d: { user: User | null }) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  if (loading) return <div className="h-11 w-28" aria-hidden="true" />

  if (!user) {
    return (
      <a
        href="/api/auth/google"
        className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#DDDAD0] bg-white px-4 text-[15px] font-medium text-ink hover:border-ink"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.9 6.2C12.5 13.6 17.8 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" />
          <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C1 16.6 0 20.2 0 24s1 7.4 2.7 10.8l7.9-6.2z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.8-5.8l-7.4-5.7c-2.1 1.4-4.8 2.2-8.4 2.2-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.2C6.6 42.6 14.6 48 24 48z" />
        </svg>
        Google 로그인
      </a>
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
