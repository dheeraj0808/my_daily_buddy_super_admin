import type {
  AdminUser,
  ApiEnvelope,
  AuthTokens,
  AuthUser,
  CreatePlanInput,
  ListQuery,
  OtpMeta,
  Plan,
  ProcessNotificationsResult,
  UpdatePlanInput,
  UserSubscription,
} from './types'

const API_BASE = (import.meta.env.VITE_API_URL) || 'http://localhost:5001/api'

const TOKENS_KEY = 'super_admin_tokens'
const USER_KEY = 'super_admin_user'

// ---------------------------------------------------------------------------
// Auth storage
// ---------------------------------------------------------------------------

export function getStoredUser(): AuthUser | null {
  try {
    const s = localStorage.getItem(USER_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function getStoredTokens(): AuthTokens | null {
  try {
    const s = localStorage.getItem(TOKENS_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function storeAuth(tokens: AuthTokens, user?: AuthUser | null) {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch { /* ignore storage errors */ }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem(TOKENS_KEY)
    localStorage.removeItem(USER_KEY)
  } catch { /* ignore storage errors */ }
}

/** Called when the session can no longer be refreshed. Set by AuthContext. */
let onSessionExpired: (() => void) | null = null
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler
}

// ---------------------------------------------------------------------------
// Low-level fetch helpers
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function extractMessage(payload: any, fallback: string): string {
  const msg = payload?.message ?? payload?.body
  if (Array.isArray(msg)) return msg.join(', ')
  if (typeof msg === 'string' && msg) return msg
  return fallback
}

async function parseJson(res: Response): Promise<any> {
  const text = await res.text()
  try { return JSON.parse(text || '{}') }
  catch { return { message: text } }
}

async function rawRequest<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  const payload = await parseJson(res)
  if (!res.ok) throw new ApiError(extractMessage(payload, 'Request failed'), res.status)
  return payload as ApiEnvelope<T>
}

let refreshPromise: Promise<boolean> | null = null

async function tryRefreshTokens(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const tokens = getStoredTokens()
      if (!tokens?.refresh_token) return false
      try {
        const payload = await rawRequest<AuthTokens>('/auth/refresh-token', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: tokens.refresh_token }),
        })
        const next = payload.data
        if (!next?.access_token) return false
        storeAuth(next)
        return true
      } catch {
        return false
      }
    })().finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

/**
 * Authenticated request wrapper: attaches the Bearer token and, on a 401,
 * refreshes tokens once and retries. If refresh fails the session is cleared.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const doFetch = () => {
    const tokens = getStoredTokens()
    return rawRequest<T>(path, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(tokens?.access_token ? { Authorization: `Bearer ${tokens.access_token}` } : {}),
      },
    })
  }

  try {
    return await doFetch()
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const refreshed = await tryRefreshTokens()
      if (refreshed) return doFetch()
      clearStoredAuth()
      onSessionExpired?.()
    }
    throw err
  }
}

function toQueryString(query: ListQuery = {}): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    params.set(key, String(value))
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export function postSuperAdminLogin(email: string): Promise<ApiEnvelope<OtpMeta>> {
  return rawRequest<OtpMeta>('/super-admin/login', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function postVerifyOtp(userId: string, otp: string): Promise<ApiEnvelope<AuthTokens & { user: AuthUser }>> {
  const payload = await rawRequest<AuthTokens & { user: AuthUser }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ userId, otp }),
  })
  const data = payload.data
  if (data?.access_token) {
    storeAuth({ access_token: data.access_token, refresh_token: data.refresh_token }, data.user)
  }
  return payload
}

export function postResendOtp(userId: string): Promise<ApiEnvelope<OtpMeta>> {
  return rawRequest<OtpMeta>('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  })
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export function listPlans(query: ListQuery = {}): Promise<ApiEnvelope<Plan[]>> {
  return apiFetch<Plan[]>(`/admin/plans${toQueryString(query)}`)
}

export function getPlan(id: string): Promise<ApiEnvelope<Plan>> {
  return apiFetch<Plan>(`/admin/plans/${id}`)
}

export function createPlan(input: CreatePlanInput): Promise<ApiEnvelope<Plan>> {
  return apiFetch<Plan>('/admin/plans', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updatePlan(id: string, input: UpdatePlanInput): Promise<ApiEnvelope<Plan>> {
  return apiFetch<Plan>(`/admin/plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deletePlan(id: string): Promise<ApiEnvelope<string>> {
  return apiFetch<string>(`/admin/plans/${id}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

export function listSubscriptions(query: ListQuery = {}): Promise<ApiEnvelope<UserSubscription[]>> {
  return apiFetch<UserSubscription[]>(`/admin/subscriptions${toQueryString(query)}`)
}

export function createSubscription(user_id: string, plan_id: string): Promise<ApiEnvelope<UserSubscription>> {
  return apiFetch<UserSubscription>('/admin/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ user_id, plan_id }),
  })
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function listUsers(query: ListQuery = {}): Promise<ApiEnvelope<AdminUser[]>> {
  return apiFetch<AdminUser[]>(`/users/admin/list${toQueryString(query)}`)
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function processNotifications(): Promise<ApiEnvelope<ProcessNotificationsResult>> {
  return apiFetch<ProcessNotificationsResult>('/notifications/process', { method: 'POST' })
}
