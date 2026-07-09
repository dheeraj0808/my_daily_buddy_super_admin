import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Mail, Shield, KeyRound, ArrowRight, Sparkles } from 'lucide-react'
import { postSuperAdminLogin, postVerifyOtp, postResendOtp } from '../api'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'
import Alert from './ui/Alert'
import { Card } from './ui/Card'

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
      setMessage('OTP sent to your email. Check your inbox.')
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
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">My Daily Buddy</span>
          </div>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Admin control center for your wellness platform
          </h1>
          <p className="max-w-md text-lg text-brand-100">
            Manage plans, subscriptions, users, and notifications from one secure dashboard.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Plans & billing', 'User management', 'Push notifications'].map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-brand-200">© {new Date().getFullYear()} My Daily Buddy</p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-1 items-center justify-center bg-slate-50 p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">Super Admin</span>
            </div>
          </div>

          <Card className="!p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {userId ? 'Enter verification code' : 'Welcome back'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {userId
                  ? `We sent a one-time code to ${email}`
                  : 'Sign in with your super admin email'}
              </p>
            </div>

            {message && <Alert variant="success" className="mb-4">{message}</Alert>}
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            {!userId ? (
              <form onSubmit={requestOtp} className="space-y-5">
                <div>
                  <label className="label-field" htmlFor="email">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      className="input-field pl-10"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      type="email"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  Continue with OTP
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-5">
                <div>
                  <label className="label-field" htmlFor="otp">One-time password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="otp"
                      className="input-field pl-10 tracking-widest"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="• • • • • •"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  Verify & sign in
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
                    onClick={resendOtp}
                    disabled={loading || resendCooldown > 0}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-700"
                    onClick={() => { setUserId(null); setOtp(''); setError(null); setMessage(null) }}
                  >
                    Change email
                  </button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
