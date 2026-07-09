import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Mail, Shield, ArrowRight, Sparkles, Lock, CheckCircle2 } from 'lucide-react'
import { postSuperAdminLogin, postVerifyOtp, postResendOtp } from '../api'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'
import Alert from './ui/Alert'

const OTP_LENGTH = 6

export default function SuperAdminLogin() {
  const { user, setUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const otp = otpDigits.join('')

  useEffect(() => {
    let t: number | undefined
    if (resendCooldown > 0) t = window.setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
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
      setMessage('Verification code sent to your inbox.')
      setResendCooldown(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err: any) {
      setError(err.message || 'Failed to request OTP')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    if (!userId) return setError('Session expired. Please start again.')
    if (!/^[0-9]{4,8}$/.test(otp)) return setError('Enter the complete verification code')
    setLoading(true)
    try {
      const res = await postVerifyOtp(userId, otp)
      if (res.data?.user) {
        setUser(res.data.user)
        navigate('/', { replace: true })
      } else setError('Login succeeded but no user data returned.')
    } catch (err: any) {
      setError(err.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) {
      const chars = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('')
      const next = [...otpDigits]
      chars.forEach((c, i) => { if (index + i < OTP_LENGTH) next[index + i] = c })
      setOtpDigits(next)
      const focusIdx = Math.min(index + chars.length, OTP_LENGTH - 1)
      otpRefs.current[focusIdx]?.focus()
      if (next.every(d => d) && next.join('').length >= 4) verifyOtp()
      return
    }
    const digit = value.replace(/\D/g, '')
    const next = [...otpDigits]
    next[index] = digit
    setOtpDigits(next)
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus()
    if (next.every(d => d) && next.join('').length >= 4) verifyOtp()
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-brand-600/20 blur-[120px] animate-pulse-soft" />
        <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[100px] animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      </div>

      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Brand panel */}
        <div className="hidden flex-1 flex-col justify-between p-12 lg:flex xl:p-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">My Daily Buddy</p>
              <p className="text-sm text-indigo-300/70">Enterprise Admin Console</p>
            </div>
          </div>

          <div className="max-w-lg space-y-8">
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white">
              Command center for your wellness platform
            </h1>
            <p className="text-lg leading-relaxed text-slate-400">
              Securely manage subscriptions, users, billing plans, and push notifications — all from one powerful dashboard.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: Lock, text: 'OTP secured' },
                { icon: Shield, text: 'Role-based access' },
                { icon: CheckCircle2, text: 'Audit ready' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2.5 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <item.icon className="h-4 w-4 text-brand-300" />
                  <span className="text-sm font-medium text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-slate-600">© {new Date().getFullYear()} My Daily Buddy · All rights reserved</p>
        </div>

        {/* Form panel */}
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-[440px] animate-slide-up">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Super Admin</span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 sm:p-10">
              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300 ring-1 ring-brand-500/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  {userId ? 'Step 2 of 2' : 'Step 1 of 2'}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {userId ? 'Enter verification code' : 'Welcome back'}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {userId ? `Code sent to ${email}` : 'Sign in with your administrator email'}
                </p>
              </div>

              {message && <Alert variant="success" className="mb-5">{message}</Alert>}
              {error && <Alert variant="error" className="mb-5">{error}</Alert>}

              {!userId ? (
                <form onSubmit={requestOtp} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="email">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="email"
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-brand-500/50 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        type="email"
                        placeholder="admin@company.com"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" loading={loading}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} className="space-y-6">
                  <div>
                    <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">Verification code</label>
                    <div className="flex justify-between gap-2">
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => { otpRefs.current[i] = el }}
                          className="otp-box border-white/10 bg-white/5 text-white focus:border-brand-400 focus:ring-brand-500/20"
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          inputMode="numeric"
                          maxLength={6}
                          autoComplete="one-time-code"
                        />
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" loading={loading}>
                    Access dashboard
                  </Button>
                  <div className="flex items-center justify-between text-sm">
                    <button type="button" className="font-medium text-brand-400 hover:text-brand-300 disabled:opacity-40" onClick={async () => {
                      if (resendCooldown > 0) return
                      setLoading(true)
                      try {
                        await postResendOtp(userId!)
                        setMessage('New code sent.')
                        setResendCooldown(30)
                      } catch (err: any) { setError(err.message) }
                      finally { setLoading(false) }
                    }} disabled={resendCooldown > 0}>
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                    <button type="button" className="text-slate-500 hover:text-slate-300" onClick={() => { setUserId(null); setOtpDigits(Array(OTP_LENGTH).fill('')); setError(null) }}>
                      Change email
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
