import React, { useCallback, useEffect, useState } from 'react'
import { listSubscriptions, createSubscription, listPlans, listUsers } from '../api'
import type { UserSubscription, PaginationMeta, Plan, AdminUser } from '../types'
import DataTable, { Column } from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [planFilter, setPlanFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [startDateFrom, setStartDateFrom] = useState('')
  const [startDateTo, setStartDateTo] = useState('')

  const [plans, setPlans] = useState<Plan[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [assignPlanId, setAssignPlanId] = useState('')
  const [assignUserId, setAssignUserId] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userOptions, setUserOptions] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listSubscriptions({
        page,
        limit: 10,
        planId: planFilter || undefined,
        is_active: activeFilter === '' ? undefined : activeFilter,
        startDateFrom: startDateFrom || undefined,
        startDateTo: startDateTo || undefined,
      })
      setSubscriptions(res.data || [])
      setMeta(res.meta || null)
    } catch (err: any) {
      setError(err.message || 'Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }, [page, planFilter, activeFilter, startDateFrom, startDateTo])

  useEffect(() => { fetchSubscriptions() }, [fetchSubscriptions])

  useEffect(() => {
    listPlans({ limit: 100, is_active: 'true' })
      .then(res => setPlans(res.data || []))
      .catch(() => { /* plan filter simply stays empty */ })
  }, [])

  useEffect(() => {
    if (!modalOpen) return
    setUsersLoading(true)
    const t = window.setTimeout(() => {
      listUsers({ limit: 50, search: userSearch || undefined, role_id: 2, isDeleted: 'false' })
        .then(res => setUserOptions(res.data || []))
        .catch(() => setUserOptions([]))
        .finally(() => setUsersLoading(false))
    }, 300)
    return () => window.clearTimeout(t)
  }, [modalOpen, userSearch])

  function openAssign() {
    setAssignPlanId('')
    setAssignUserId('')
    setUserSearch('')
    setFormError(null)
    setModalOpen(true)
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!assignUserId) return setFormError('Select a user')
    if (!assignPlanId) return setFormError('Select a plan')
    setSaving(true)
    try {
      await createSubscription(assignUserId, assignPlanId)
      setMessage('Subscription assigned successfully.')
      setModalOpen(false)
      fetchSubscriptions()
    } catch (err: any) {
      setFormError(err.message || 'Failed to assign subscription')
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<UserSubscription>[] = [
    {
      key: 'user',
      header: 'User',
      render: s => (
        <div>
          <div><strong>{s.user?.email || s.user_id}</strong></div>
          {(s.user?.first_name || s.user?.last_name) && (
            <div className="muted">{[s.user?.first_name, s.user?.last_name].filter(Boolean).join(' ')}</div>
          )}
        </div>
      ),
    },
    { key: 'plan', header: 'Plan', render: s => s.plan?.name || s.plan_id },
    { key: 'start_date', header: 'Start Date', render: s => s.start_date },
    { key: 'end_date', header: 'End Date', render: s => s.end_date },
    { key: 'is_active', header: 'Status', render: s => <StatusBadge active={s.is_active} activeLabel="Active" inactiveLabel="Expired" /> },
  ]

  return (
    <div>
      <div className="page-header">
        <h2>Subscriptions</h2>
        <button type="button" onClick={openAssign}>Assign Subscription</button>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="filters">
        <div className="form-group">
          <label>Plan</label>
          <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1) }}>
            <option value="">All plans</option>
            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(1) }}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="form-group">
          <label>Start Date From</label>
          <input type="date" value={startDateFrom} onChange={e => { setStartDateFrom(e.target.value); setPage(1) }} />
        </div>
        <div className="form-group">
          <label>Start Date To</label>
          <input type="date" value={startDateTo} onChange={e => { setStartDateTo(e.target.value); setPage(1) }} />
        </div>
      </div>

      <DataTable columns={columns} rows={subscriptions} rowKey={s => s.id} loading={loading} emptyMessage="No subscriptions found." />
      <Pagination meta={meta} onPageChange={setPage} />

      <Modal title="Assign Subscription" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleAssign}>
          {formError && <div className="error">{formError}</div>}
          <div className="form-group">
            <label>Search User</label>
            <input
              value={userSearch}
              placeholder="Search by email or phone"
              onChange={e => setUserSearch(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>User *</label>
            <select value={assignUserId} onChange={e => setAssignUserId(e.target.value)} required>
              <option value="">{usersLoading ? 'Loading users…' : 'Select a user'}</option>
              {userOptions.map(u => (
                <option key={u.id} value={u.id}>{u.email}{u.phone ? ` (${u.phone})` : ''}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Plan *</label>
            <select value={assignPlanId} onChange={e => setAssignPlanId(e.target.value)} required>
              <option value="">Select a plan</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} — {p.duration_days} days</option>
              ))}
            </select>
          </div>
          <p className="muted">Assigning a new plan deactivates the user's current active subscription.</p>
          <div className="row">
            <button type="submit" disabled={saving}>{saving ? 'Assigning...' : 'Assign'}</button>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
