type ApiResult<T = any> = {
  success?: boolean
  httpStatus?: number
  body?: T
}

const API_BASE = (import.meta.env.VITE_API_URL) || 'http://localhost:3000/api'

function safeJson(res: Response) {
  return res.text().then(t => {
    try { return JSON.parse(t || '{}') }
    catch { return { body: t } }
  })
}

export async function postSuperAdminLogin(email: string): Promise<ApiResult> {
  const res = await fetch(`${API_BASE}/super-admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await safeJson(res)
  if (!res.ok) throw new Error(data?.body || data?.message || 'Request failed')
  return data
}

export async function postVerifyOtp(userId: string, otp: string): Promise<ApiResult> {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otp }),
  })
  const data = await safeJson(res)
  if (!res.ok) throw new Error(data?.body || data?.message || 'Verification failed')
  // store tokens/user if present
  try {
    const body = data.body || {}
    const tokens = { access_token: body.access_token, refresh_token: body.refresh_token }
    if (tokens.access_token) localStorage.setItem('super_admin_tokens', JSON.stringify(tokens))
    if (body.user) localStorage.setItem('super_admin_user', JSON.stringify(body.user))
  } catch (e) { /* ignore storage errors */ }
  return data
}

export async function postResendOtp(userId: string): Promise<ApiResult> {
  const res = await fetch(`${API_BASE}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  const data = await safeJson(res)
  if (!res.ok) throw new Error(data?.body || data?.message || 'Resend failed')
  return data
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem('super_admin_tokens')
    localStorage.removeItem('super_admin_user')
  } catch (_) {}
}

export function getStoredUser() {
  try {
    const s = localStorage.getItem('super_admin_user')
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function getStoredTokens() {
  try {
    const s = localStorage.getItem('super_admin_tokens')
    return s ? JSON.parse(s) : null
  } catch { return null }
}
