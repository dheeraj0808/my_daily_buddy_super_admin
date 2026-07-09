/**
 * Deep integration test for super-admin API + UI prerequisites.
 * Run: node scripts/e2e-test.mjs
 */
const API = process.env.VITE_API_URL || 'http://localhost:5001/api'
const EMAIL = process.env.SA_EMAIL || 'dheerajsingh1939@gmail.com'
const TERMINAL_LOG = process.env.SA_TERMINAL_LOG || ''

let passed = 0
let failed = 0
const results = []

function ok(name, detail = '') {
  passed++
  results.push({ status: 'PASS', name, detail })
  console.log(`✅ ${name}${detail ? ` — ${detail}` : ''}`)
}

function fail(name, detail = '') {
  failed++
  results.push({ status: 'FAIL', name, detail })
  console.error(`❌ ${name}${detail ? ` — ${detail}` : ''}`)
}

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  const text = await res.text()
  let body
  try { body = JSON.parse(text) } catch { body = { message: text } }
  return { res, body }
}

async function login() {
  let userId = process.env.SA_USER_ID
  let otp = process.env.SA_OTP

  if (!userId || !otp) {
    const loginRes = await request('/super-admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: EMAIL }),
    })
    if (!loginRes.res.ok) {
      fail('Super admin login', loginRes.body.message)
      return null
    }
    ok('Super admin login', `userId=${loginRes.body.data?.userId}`)
    userId = loginRes.body.data.userId

    if (!otp && TERMINAL_LOG) {
      const fs = await import('fs')
      const log = fs.readFileSync(TERMINAL_LOG, 'utf8')
      const m = log.match(new RegExp(`OTP for ${EMAIL.replace('.', '\\.')}: (\\d+)`))
      if (m) otp = m[1]
    }

    if (!otp) {
      fail('OTP verify', 'Set SA_OTP env or SA_TERMINAL_LOG path')
      return null
    }
  } else {
    ok('Super admin login', 'skipped (SA_USER_ID + SA_OTP provided)')
  }

  const verifyRes = await request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ userId, otp }),
  })
  if (!verifyRes.res.ok) {
    fail('OTP verify', verifyRes.body.message)
    return null
  }
  const token = verifyRes.body.data?.access_token
  const refresh = verifyRes.body.data?.refresh_token
  if (!token) { fail('OTP verify', 'no access_token'); return null }
  ok('OTP verify', `role_id=${verifyRes.body.data?.user?.role_id}`)
  return { token, refresh, user: verifyRes.body.data.user }
}

async function authed(path, token, options = {}) {
  return request(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  })
}

async function main() {
  console.log(`\n🔍 Super Admin E2E Test — ${API}\n`)

  // Public endpoints
  const plansPublic = await request('/admin/plans?limit=2')
  if (plansPublic.res.ok && plansPublic.body.meta?.total != null) {
    ok('GET /admin/plans (public)', `total=${plansPublic.body.meta.total}`)
  } else fail('GET /admin/plans (public)', plansPublic.body.message)

  const auth = await login()
  if (!auth) {
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`)
    process.exit(1)
  }

  const { token, refresh } = auth

  // Dashboard stats endpoints
  for (const [label, qs] of [
    ['listPlans', '?limit=1'],
    ['listPlans active', '?limit=1&is_active=true'],
    ['listSubscriptions', '/admin/subscriptions?limit=1'],
    ['listUsers', '/users/admin/list?limit=1'],
  ]) {
    const path = label.startsWith('listUsers') ? qs : label.startsWith('listSubscriptions') ? qs : `/admin/plans${qs}`
    const r = await authed(path, token)
    if (r.res.ok && r.body.meta) ok(`Dashboard: ${label}`, `total=${r.body.meta.total}`)
    else fail(`Dashboard: ${label}`, r.body.message)
  }

  // Users with filters
  const usersFiltered = await authed('/users/admin/list?limit=5&role_id=2&isDeleted=false', token)
  if (usersFiltered.res.ok) ok('Users list + filters', `${usersFiltered.body.data?.length} rows`)
  else fail('Users list + filters', usersFiltered.body.message)

  // Plans list with filters
  const plansFiltered = await authed('/admin/plans?limit=5&is_active=true', token)
  if (plansFiltered.res.ok) ok('Plans list + filter', `${plansFiltered.body.data?.length} rows`)
  else fail('Plans list + filter', plansFiltered.body.message)

  // Subscriptions list
  const subs = await authed('/admin/subscriptions?limit=5', token)
  if (subs.res.ok) ok('Subscriptions list', `${subs.body.data?.length} rows`)
  else fail('Subscriptions list', subs.body.message)

  // Create test plan
  const planName = `E2E Test ${Date.now()}`
  const createPlan = await authed('/admin/plans', token, {
    method: 'POST',
    body: JSON.stringify({ name: planName, duration_days: 7, plan_code: `E2E_${Date.now()}`, price: 99 }),
  })
  let planId = createPlan.body.data?.id
  if (createPlan.res.ok && planId) ok('Create plan', planId)
  else fail('Create plan', createPlan.body.message)

  // Update plan
  if (planId) {
    const update = await authed(`/admin/plans/${planId}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ price: 149, description: 'E2E updated' }),
    })
    if (update.res.ok) ok('Update plan', `price=${update.body.data?.price}`)
    else fail('Update plan', update.body.message)

    // Soft delete
    const del = await authed(`/admin/plans/${planId}`, token, { method: 'DELETE' })
    if (del.res.ok) ok('Delete plan (soft)', 'ok')
    else fail('Delete plan', del.body.message)
  }

  // Assign subscription (if user + active plan exist)
  const users = await authed('/users/admin/list?limit=1&role_id=2&isDeleted=false', token)
  const activePlans = await authed('/admin/plans?limit=1&is_active=true', token)
  const userId = users.body.data?.[0]?.id
  const activePlanId = activePlans.body.data?.[0]?.id
  if (userId && activePlanId) {
    const assign = await authed('/admin/subscriptions', token, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, plan_id: activePlanId }),
    })
    if (assign.res.ok) ok('Assign subscription', assign.body.data?.id)
    else fail('Assign subscription', assign.body.message)
  } else {
    fail('Assign subscription', 'no user or active plan available')
  }

  // Notifications process
  const notif = await authed('/notifications/process', token, { method: 'POST' })
  if (notif.res.ok && notif.body.data) {
    ok('Process notifications', `processed=${notif.body.data.processed}, sent=${notif.body.data.sent}`)
  } else fail('Process notifications', notif.body.message)

  // Token refresh
  const refreshRes = await request('/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refresh }),
  })
  if (refreshRes.res.ok && refreshRes.body.data?.access_token) ok('Refresh token', 'new token issued')
  else fail('Refresh token', refreshRes.body.message)

  // 401 without token
  const unauthorized = await request('/users/admin/list')
  if (unauthorized.res.status === 401) ok('Unauthorized without token', '401 as expected')
  else fail('Unauthorized without token', `got ${unauthorized.res.status}`)

  // Wrong role blocked from super-admin login
  const regularUser = await request('/super-admin/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nonexistent-test@example.com' }),
  })
  if (regularUser.res.status === 404) ok('Non-existent email', '404 as expected')
  else if (regularUser.res.status === 403) ok('Non-super-admin blocked', '403 as expected')
  else fail('Login edge case', `status ${regularUser.res.status}`)

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`)
  if (failed > 0) process.exit(1)
}

main().catch(e => { console.error(e); process.exit(1) })
