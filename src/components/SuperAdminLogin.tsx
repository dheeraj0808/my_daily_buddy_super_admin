import React, { useState, useEffect } from 'react'
import { postSuperAdminLogin, postVerifyOtp, postResendOtp, clearStoredAuth, getStoredUser } from '../api'

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any | null>(getStoredUser())
  const [resendCooldown, setResendCooldown] = useState<number>(0)

  useEffect(() => {
    let t: number | undefined
    if (resendCooldown > 0) {
      t = window.setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    }
    return () => { if (t) clearTimeout(t) }
  }, [resendCooldown])

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!email) return setError('Email is required')
    setLoading(true)
    try {
      const data = await postSuperAdminLogin(email)
      setUserId(data?.body?.userId || data?.body?.user_id || null)
      setMessage('OTP sent to email. Check your inbox.')
      setResendCooldown(30)
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
    if (!/^[0-9]{4,8}$/.test(otp)) return setError('OTP must be numeric (4-8 digits)')
    setLoading(true)
    try {
      const data = await postVerifyOtp(userId, otp)
      setMessage('Login successful.')
      const body = data?.body || {}
      const loggedUser = body.user || null
      setUser(loggedUser)
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
    if (resendCooldown > 0) return setError(`Please wait ${resendCooldown}s before resending`)
    setLoading(true)
    try {
      await postResendOtp(userId)
      setMessage('OTP resent. Check your email.')
      setResendCooldown(30)
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    clearStoredAuth()
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
            <input value={otp} onChange={e => setOtp(e.target.value)} type="text" inputMode="numeric" pattern="[0-9]*" required />
          </div>
          <div className="row">
            <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
            <button type="button" className="inline-link" onClick={resendOtp} disabled={loading || resendCooldown>0}>{resendCooldown>0?`Resend (${resendCooldown}s)`:'Resend OTP'}</button>
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
