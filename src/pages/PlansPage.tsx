import React, { useCallback, useEffect, useState } from 'react'
import { listPlans, createPlan, updatePlan, deletePlan } from '../api'
import type { Plan, PaginationMeta, CreatePlanInput } from '../types'
import DataTable, { Column } from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'

interface PlanFormState {
  name: string
  plan_code: string
  duration_days: string
  price: string
  compare_at_price: string
  description: string
}

const EMPTY_FORM: PlanFormState = {
  name: '',
  plan_code: '',
  duration_days: '',
  price: '',
  compare_at_price: '',
  description: '',
}

function formatPrice(value: number | string): string {
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(2) : String(value)
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [form, setForm] = useState<PlanFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listPlans({
        page,
        limit: 10,
        search: search || undefined,
        is_active: activeFilter === '' ? undefined : activeFilter,
      })
      setPlans(res.data || [])
      setMeta(res.meta || null)
    } catch (err: any) {
      setError(err.message || 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }, [page, search, activeFilter])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  function openCreate() {
    setEditingPlan(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(plan: Plan) {
    setEditingPlan(plan)
    setForm({
      name: plan.name,
      plan_code: plan.plan_code || '',
      duration_days: String(plan.duration_days),
      price: plan.price != null ? String(plan.price) : '',
      compare_at_price: plan.compare_at_price != null ? String(plan.compare_at_price) : '',
      description: plan.description || '',
    })
    setFormError(null)
    setModalOpen(true)
  }

  function setField(field: keyof PlanFormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.name.trim()) return setFormError('Name is required')
    const durationDays = Number(form.duration_days)
    if (!Number.isInteger(durationDays) || durationDays < 1) {
      return setFormError('Duration must be an integer of at least 1 day')
    }
    setSaving(true)
    try {
      if (editingPlan) {
        const input: Partial<CreatePlanInput> = {
          name: form.name.trim(),
          duration_days: durationDays,
        }
        if (form.price !== '') input.price = Number(form.price)
        if (form.compare_at_price !== '') input.compare_at_price = Number(form.compare_at_price)
        if (form.description.trim() !== '') input.description = form.description.trim()
        await updatePlan(editingPlan.id, input)
        setMessage(`Plan "${form.name.trim()}" updated.`)
      } else {
        const input: CreatePlanInput = {
          name: form.name.trim(),
          duration_days: durationDays,
        }
        if (form.plan_code.trim() !== '') input.plan_code = form.plan_code.trim()
        if (form.price !== '') input.price = Number(form.price)
        if (form.compare_at_price !== '') input.compare_at_price = Number(form.compare_at_price)
        if (form.description.trim() !== '') input.description = form.description.trim()
        await createPlan(input)
        setMessage(`Plan "${form.name.trim()}" created.`)
      }
      setModalOpen(false)
      fetchPlans()
    } catch (err: any) {
      setFormError(err.message || 'Failed to save plan')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(plan: Plan) {
    if (!window.confirm(`Deactivate plan "${plan.name}"? It will no longer be assignable.`)) return
    setError(null)
    try {
      await deletePlan(plan.id)
      setMessage(`Plan "${plan.name}" deleted.`)
      fetchPlans()
    } catch (err: any) {
      setError(err.message || 'Failed to delete plan')
    }
  }

  const columns: Column<Plan>[] = [
    { key: 'name', header: 'Name', render: p => <strong>{p.name}</strong> },
    { key: 'plan_code', header: 'Code', render: p => p.plan_code || '—' },
    { key: 'duration_days', header: 'Duration (days)', render: p => p.duration_days },
    { key: 'price', header: 'Price', render: p => formatPrice(p.price) },
    { key: 'compare_at_price', header: 'Compare At', render: p => formatPrice(p.compare_at_price) },
    { key: 'is_active', header: 'Status', render: p => <StatusBadge active={p.is_active} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: p => (
        <div className="row">
          <button type="button" className="btn-secondary btn-small" onClick={() => openEdit(p)}>Edit</button>
          {p.is_active && (
            <button type="button" className="btn-danger btn-small" onClick={() => handleDelete(p)}>Delete</button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h2>Plans</h2>
        <button type="button" onClick={openCreate}>Create Plan</button>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="filters">
        <div className="form-group">
          <label>Search</label>
          <input
            value={search}
            placeholder="Name or description"
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(1) }}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} rows={plans} rowKey={p => p.id} loading={loading} emptyMessage="No plans found." />
      <Pagination meta={meta} onPageChange={setPage} />

      <Modal title={editingPlan ? 'Edit Plan' : 'Create Plan'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          {formError && <div className="error">{formError}</div>}
          <div className="form-group">
            <label>Name *</label>
            <input value={form.name} onChange={e => setField('name', e.target.value)} maxLength={255} required />
          </div>
          {!editingPlan && (
            <div className="form-group">
              <label>Plan Code</label>
              <input value={form.plan_code} onChange={e => setField('plan_code', e.target.value)} maxLength={100} />
            </div>
          )}
          <div className="form-group">
            <label>Duration (days) *</label>
            <input
              type="number"
              min={1}
              step={1}
              value={form.duration_days}
              onChange={e => setField('duration_days', e.target.value)}
              required
            />
          </div>
          <div className="row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Price</label>
              <input type="number" min={0} step="0.01" value={form.price} onChange={e => setField('price', e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Compare At Price</label>
              <input type="number" min={0} step="0.01" value={form.compare_at_price} onChange={e => setField('compare_at_price', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setField('description', e.target.value)} maxLength={1000} />
          </div>
          <div className="row">
            <button type="submit" disabled={saving}>{saving ? 'Saving...' : (editingPlan ? 'Save Changes' : 'Create Plan')}</button>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
