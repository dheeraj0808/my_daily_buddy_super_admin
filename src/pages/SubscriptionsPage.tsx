import React, { useCallback, useEffect, useState } from 'react'
import { Plus, UserPlus } from 'lucide-react'
import { listSubscriptions, createSubscription, listPlans, listUsers } from '../api'
import type { UserSubscription, PaginationMeta, Plan, AdminUser } from '../types'
import DataTable, { Column } from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import PageHeader, { PageShell } from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import FilterBar, { FilterField } from '../components/ui/FilterBar'
import { getInitials } from '../lib/utils'

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [planFilter, setPlanFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [startDateFrom, setStartDateFrom] = useState('')
  const [startDateTo, setStartDateTo] = useState('')
  const [plans, setPlans] = useState<Plan[]>([])
  const [filterUsers, setFilterUsers] = useState<AdminUser[]>([])
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
        page, limit: 10,
        planId: planFilter || undefined,
        userId: userFilter || undefined,
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
  }, [page, planFilter, userFilter, activeFilter, startDateFrom, startDateTo])

  useEffect(() => { fetchSubscriptions() }, [fetchSubscriptions])
  useEffect(() => {
    listPlans({ limit: 100, is_active: 'true' }).then(res => setPlans(res.data || [])).catch(() => {})
    listUsers({ limit: 100, role_id: 2, isDeleted: 'false' }).then(res => setFilterUsers(res.data || [])).catch(() => {})
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
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {getInitials(s.user?.email)}
          </div>
          <div>
            <p className="font-medium text-slate-900">{s.user?.email || s.user_id}</p>
            {(s.user?.first_name || s.user?.last_name) && (
              <p className="text-xs text-slate-400">{[s.user?.first_name, s.user?.last_name].filter(Boolean).join(' ')}</p>
            )}
          </div>
        </div>
      ),
    },
    { key: 'plan', header: 'Plan', render: s => (
      <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">
        {s.plan?.name || s.plan_id}
      </span>
    )},
    { key: 'start_date', header: 'Start', render: s => new Date(s.start_date).toLocaleDateString() },
    { key: 'end_date', header: 'End', render: s => new Date(s.end_date).toLocaleDateString() },
    { key: 'is_active', header: 'Status', render: s => <StatusBadge active={s.is_active} activeLabel="Active" inactiveLabel="Expired" /> },
  ]

  return (
    <PageShell>
      <PageHeader
        title="Subscriptions"
        description="View and assign subscription plans to users."
        badge="Revenue"
        action={<Button onClick={() => { setAssignPlanId(''); setAssignUserId(''); setUserSearch(''); setFormError(null); setModalOpen(true) }}><UserPlus className="h-4 w-4" />Assign Plan</Button>}
      />
      {message && <Alert variant="success" className="mb-4" onDismiss={() => setMessage(null)}>{message}</Alert>}
      {error && <Alert variant="error" className="mb-4" onDismiss={() => setError(null)}>{error}</Alert>}

      <FilterBar>
        <FilterField label="Plan">
          <select className="select-field" value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1) }}>
            <option value="">All plans</option>
            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </FilterField>
        <FilterField label="User">
          <select className="select-field" value={userFilter} onChange={e => { setUserFilter(e.target.value); setPage(1) }}>
            <option value="">All users</option>
            {filterUsers.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
          </select>
        </FilterField>
        <FilterField label="Status">
          <select className="select-field" value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(1) }}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </FilterField>
        <FilterField label="From">
          <input className="input-field" type="date" value={startDateFrom} onChange={e => { setStartDateFrom(e.target.value); setPage(1) }} />
        </FilterField>
        <FilterField label="To">
          <input className="input-field" type="date" value={startDateTo} onChange={e => { setStartDateTo(e.target.value); setPage(1) }} />
        </FilterField>
      </FilterBar>

      <DataTable columns={columns} rows={subscriptions} rowKey={s => s.id} loading={loading} emptyMessage="No subscriptions found" />
      <Pagination meta={meta} onPageChange={setPage} />

      <Modal title="Assign Subscription" description="Select a user and plan. This will deactivate any existing active subscription." open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleAssign} className="space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}
          <div>
            <label className="label-field">Search user</label>
            <input className="input-field" value={userSearch} placeholder="Email or phone" onChange={e => setUserSearch(e.target.value)} />
          </div>
          <div>
            <label className="label-field">User *</label>
            <select className="select-field" value={assignUserId} onChange={e => setAssignUserId(e.target.value)} required>
              <option value="">{usersLoading ? 'Loading…' : 'Select a user'}</option>
              {userOptions.map(u => <option key={u.id} value={u.id}>{u.email}{u.phone ? ` · ${u.phone}` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Plan *</label>
            <select className="select-field" value={assignPlanId} onChange={e => setAssignPlanId(e.target.value)} required>
              <option value="">Select a plan</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name} — {p.duration_days} days</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}><Plus className="h-4 w-4" />Assign</Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  )
}
