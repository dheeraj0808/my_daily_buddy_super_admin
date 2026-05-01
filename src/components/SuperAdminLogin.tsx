import React, { useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_URL) || 'http://localhost:3000/api'

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any | null>(null)

  // initialise from stored tokens/user
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('super_admin_user')
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch (e) {
      // ignore
    }
  }, [])

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/super-admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.body || data?.message || 'Request failed')

      // API returns userId in body when OTP is sent
      setUserId(data?.body?.userId || data?.body?.user_id || null)
      setMessage('OTP sent to email. Check your inbox.')
    } catch (err: any) {
      setError(err.message || 'Failed to request OTP')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!userId) return setError('Missing user ID. Request OTP again.')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.body || data?.message || 'Verification failed')

      setMessage('Login successful.')
      // store tokens and user
      const body = data?.body || {}
      const tokens = { access_token: body.access_token, refresh_token: body.refresh_token }
      const loggedUser = body.user || null
      try {
        localStorage.setItem('super_admin_tokens', JSON.stringify(tokens))
        if (loggedUser) localStorage.setItem('super_admin_user', JSON.stringify(loggedUser))
      } catch (e) {
        // ignore
      }
      setUser(loggedUser)
      // optionally show tokens in console for developer
      console.log('auth result', body)
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  async function resendOtp() {
    setError(null)
    setMessage(null)
    if (!userId) return setError('Missing user ID. Request OTP again.')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.body || data?.message || 'Resend failed')
      setMessage('OTP resent. Check your email.')
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    try {
      localStorage.removeItem('super_admin_tokens')
      localStorage.removeItem('super_admin_user')
    } catch (e) {
      // ignore
    }
    setUser(null)
    setUserId(null)
    setEmail('')
    setOtp('')
    setMessage('Logged out successfully.')
  }

  return (
    <div>
      {message && <div className="message">{message}</div>}
      {error && <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>}

      {!user && !userId && (
        <form onSubmit={requestOtp}>
          <div className="form-group">
            <label>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="row">
            <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
          </div>
          <p className="muted" style={{ marginTop: 10 }}>Use the super admin email to request an OTP.</p>
        </form>
      )}

      {userId && !user && (
        <form onSubmit={verifyOtp}>
          <div className="form-group">
            <label>OTP</label>
            <input value={otp} onChange={e => setOtp(e.target.value)} type="text" required />
          </div>
          <div className="row">
            <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
            <button type="button" className="inline-link" onClick={resendOtp} disabled={loading}>Resend OTP</button>
          </div>
          <p className="muted" style={{ marginTop: 10 }}>OTP will expire quickly — check spam if not visible.</p>
        </form>
      )}

      {user && (
        <div>
          <div className="message">Signed in as <strong>{user.email}</strong></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
      )}
    </div>
  )
}
