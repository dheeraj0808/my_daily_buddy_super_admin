import React, { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { listPlans, createPlan, updatePlan, deletePlan } from '../api'
import type { Plan, PaginationMeta, CreatePlanInput } from '../types'
import DataTable, { Column } from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import PageHeader, { PageShell } from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import FilterBar, { FilterField } from '../components/ui/FilterBar'

interface PlanFormState {
  name: string
  plan_code: string
  duration_days: string
  price: string
  compare_at_price: string
  description: string
}

const EMPTY_FORM: PlanFormState = {
  name: '', plan_code: '', duration_days: '', price: '', compare_at_price: '', description: '',
}

function formatPrice(value: number | string): string {
  const n = Number(value)
  return Number.isFinite(n) ? `₹${n.toFixed(2)}` : String(value)
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
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
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
        page, limit: 10,
        search: search || undefined,
        is_active: activeFilter === '' ? undefined : activeFilter,
        minPrice: minPrice !== '' ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
      })
      setPlans(res.data || [])
      setMeta(res.meta || null)
    } catch (err: any) {
      setError(err.message || 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }, [page, search, activeFilter, minPrice, maxPrice])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  function openCreate() { setEditingPlan(null); setForm(EMPTY_FORM); setFormError(null); setModalOpen(true) }
  function openEdit(plan: Plan) {
    setEditingPlan(plan)
    setForm({
      name: plan.name, plan_code: plan.plan_code || '',
      duration_days: String(plan.duration_days),
      price: plan.price != null ? String(plan.price) : '',
      compare_at_price: plan.compare_at_price != null ? String(plan.compare_at_price) : '',
      description: plan.description || '',
    })
    setFormError(null)
    setModalOpen(true)
  }
  function setField(field: keyof PlanFormState, value: string) { setForm(prev => ({ ...prev, [field]: value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.name.trim()) return setFormError('Name is required')
    const durationDays = Number(form.duration_days)
    if (!Number.isInteger(durationDays) || durationDays < 1) return setFormError('Duration must be at least 1 day')
    setSaving(true)
    try {
      if (editingPlan) {
        const input: Partial<CreatePlanInput> = { name: form.name.trim(), duration_days: durationDays }
        if (form.price !== '') input.price = Number(form.price)
        if (form.compare_at_price !== '') input.compare_at_price = Number(form.compare_at_price)
        if (form.description.trim()) input.description = form.description.trim()
        await updatePlan(editingPlan.id, input)
        setMessage(`Plan "${form.name.trim()}" updated successfully.`)
      } else {
        const input: CreatePlanInput = { name: form.name.trim(), duration_days: durationDays }
        if (form.plan_code.trim()) input.plan_code = form.plan_code.trim()
        if (form.price !== '') input.price = Number(form.price)
        if (form.compare_at_price !== '') input.compare_at_price = Number(form.compare_at_price)
        if (form.description.trim()) input.description = form.description.trim()
        await createPlan(input)
        setMessage(`Plan "${form.name.trim()}" created successfully.`)
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
    if (!window.confirm(`Deactivate plan "${plan.name}"?`)) return
    try {
      await deletePlan(plan.id)
      setMessage(`Plan "${plan.name}" deactivated.`)
      fetchPlans()
    } catch (err: any) {
      setError(err.message || 'Failed to delete plan')
    }
  }

  const columns: Column<Plan>[] = [
    { key: 'name', header: 'Plan', render: p => (
      <div>
        <p className="font-semibold text-slate-900">{p.name}</p>
        {p.description && <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">{p.description}</p>}
      </div>
    )},
    { key: 'plan_code', header: 'Code', render: p => <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{p.plan_code || '—'}</code> },
    { key: 'duration_days', header: 'Duration', render: p => <span>{p.duration_days} days</span> },
    { key: 'price', header: 'Price', render: p => <span className="font-medium">{formatPrice(p.price)}</span> },
    { key: 'compare_at_price', header: 'Compare at', render: p => <span className="text-slate-400 line-through">{formatPrice(p.compare_at_price)}</span> },
    { key: 'is_active', header: 'Status', render: p => <StatusBadge active={p.is_active} /> },
    { key: 'actions', header: '', className: 'text-right', render: p => (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
        {p.is_active && (
          <Button variant="ghost" size="sm" onClick={() => handleDelete(p)} className="text-red-600 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    )},
  ]

  return (
    <PageShell>
      <PageHeader
        title="Subscription Plans"
        description="Create and manage pricing plans for your users."
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" />Create Plan</Button>}
      />
      {message && <Alert variant="success" className="mb-4" onDismiss={() => setMessage(null)}>{message}</Alert>}
      {error && <Alert variant="error" className="mb-4" onDismiss={() => setError(null)}>{error}</Alert>}

      <FilterBar>
        <FilterField label="Search">
          <input className="input-field" value={search} placeholder="Name or description" onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </FilterField>
        <FilterField label="Status">
          <select className="select-field" value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(1) }}>
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </FilterField>
        <FilterField label="Min price">
          <input className="input-field" type="number" min={0} step="0.01" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1) }} />
        </FilterField>
        <FilterField label="Max price">
          <input className="input-field" type="number" min={0} step="0.01" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1) }} />
        </FilterField>
      </FilterBar>

      <DataTable columns={columns} rows={plans} rowKey={p => p.id} loading={loading} emptyMessage="No plans found" />
      <Pagination meta={meta} onPageChange={setPage} />

      <Modal title={editingPlan ? 'Edit Plan' : 'Create Plan'} description={editingPlan ? 'Update plan details below.' : 'Fill in the details for the new plan.'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}
          <div>
            <label className="label-field">Name *</label>
            <input className="input-field" value={form.name} onChange={e => setField('name', e.target.value)} maxLength={255} required />
          </div>
          {!editingPlan && (
            <div>
              <label className="label-field">Plan code</label>
              <input className="input-field" value={form.plan_code} onChange={e => setField('plan_code', e.target.value)} maxLength={100} placeholder="e.g. PREMIUM_MONTHLY" />
            </div>
          )}
          <div>
            <label className="label-field">Duration (days) *</label>
            <input className="input-field" type="number" min={1} value={form.duration_days} onChange={e => setField('duration_days', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Price</label>
              <input className="input-field" type="number" min={0} step="0.01" value={form.price} onChange={e => setField('price', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Compare at price</label>
              <input className="input-field" type="number" min={0} step="0.01" value={form.compare_at_price} onChange={e => setField('compare_at_price', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea className="input-field min-h-[80px]" value={form.description} onChange={e => setField('description', e.target.value)} maxLength={1000} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingPlan ? 'Save changes' : 'Create plan'}</Button>
          </div>
        </form>
      </Modal>
    </PageShell>
  )
}
