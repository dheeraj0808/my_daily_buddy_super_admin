import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { postSuperAdminLogin, postVerifyOtp, postResendOtp } from '../api'
import { useAuth } from '../context/AuthContext'

export default function SuperAdminLogin() {
  const { user, setUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState<number>(0)

  useEffect(() => {
    let t: number | undefined
    if (resendCooldown > 0) {
      t = window.setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    }
    return () => { if (t) clearTimeout(t) }
  }, [resendCooldown])

  if (isAuthenticated && user) {
    const from = (location.state as { from?: string } | null)?.from || '/'
    return <Navigate to={from} replace />
  }

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!email) return setError('Email is required')
    setLoading(true)
    try {
      const res = await postSuperAdminLogin(email)
      setUserId(res.data?.userId || null)
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
      const res = await postVerifyOtp(userId, otp)
      const loggedUser = res.data?.user || null
      if (loggedUser) {
        setUser(loggedUser)
        navigate('/', { replace: true })
      } else {
        setError('Login succeeded but no user data was returned.')
      }
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

  return (
    <div className="login-root">
      <h1>Super Admin Login</h1>
      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}

      {!userId && (
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

      {userId && (
        <form onSubmit={verifyOtp}>
          <div className="form-group">
            <label>OTP</label>
            <input value={otp} onChange={e => setOtp(e.target.value)} type="text" inputMode="numeric" pattern="[0-9]*" required />
          </div>
          <div className="row">
            <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
            <button type="button" className="inline-link" onClick={resendOtp} disabled={loading || resendCooldown > 0}>
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
            </button>
          </div>
          <p className="muted" style={{ marginTop: 10 }}>OTP will expire quickly — check spam if not visible.</p>
        </form>
      )}
    </div>
  )
}
