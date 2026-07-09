import React, { useCallback, useEffect, useState } from 'react'
import { listUsers } from '../api'
import type { AdminUser, PaginationMeta } from '../types'
import DataTable, { Column } from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import StatusBadge, { RoleBadge } from '../components/ui/StatusBadge'
import PageHeader, { PageShell } from '../components/ui/PageHeader'
import Alert from '../components/ui/Alert'
import FilterBar, { FilterField } from '../components/ui/FilterBar'
import { getInitials } from '../lib/utils'

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [deletedFilter, setDeletedFilter] = useState('')
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listUsers({
        page, limit: 10,
        search: search || undefined,
        role_id: roleFilter === '' ? undefined : roleFilter,
        isActive: activeFilter === '' ? undefined : activeFilter,
        isDeleted: deletedFilter === '' ? undefined : deletedFilter,
        createdAtFrom: createdFrom || undefined,
        createdAtTo: createdTo || undefined,
      })
      setUsers(res.data || [])
      setMeta(res.meta || null)
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, activeFilter, deletedFilter, createdFrom, createdTo])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const columns: Column<AdminUser>[] = [
    {
      key: 'email',
      header: 'User',
      render: u => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            {getInitials(u.email)}
          </div>
          <div>
            <p className="font-medium text-slate-900">{u.email}</p>
            {u.phone && <p className="text-xs text-slate-400">{u.phone}</p>}
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: u => <RoleBadge roleId={u.role_id} /> },
    { key: 'verified', header: 'Verified', render: u => <StatusBadge active={u.isVerified} activeLabel="Verified" inactiveLabel="Unverified" variant="blue" /> },
    { key: 'active', header: 'Status', render: u => <StatusBadge active={u.isActive} /> },
    { key: 'deleted', header: 'Deleted', render: u => u.isDeleted ? <StatusBadge active={false} inactiveLabel="Deleted" /> : <span className="text-slate-300">—</span> },
    { key: 'created', header: 'Joined', render: u => <span className="text-slate-500">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span> },
  ]

  return (
    <PageShell>
      <PageHeader title="Users" description="Browse and filter registered platform users." badge="Directory" />
      {error && <Alert variant="error" className="mb-4" onDismiss={() => setError(null)}>{error}</Alert>}

      <FilterBar>
        <FilterField label="Search">
          <input className="input-field" value={search} placeholder="Email or phone" onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </FilterField>
        <FilterField label="Role">
          <select className="select-field" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
            <option value="">All roles</option>
            <option value="0">Super Admin</option>
            <option value="1">Admin</option>
            <option value="2">User</option>
          </select>
        </FilterField>
        <FilterField label="Active">
          <select className="select-field" value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(1) }}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </FilterField>
        <FilterField label="Deleted">
          <select className="select-field" value={deletedFilter} onChange={e => { setDeletedFilter(e.target.value); setPage(1) }}>
            <option value="">All</option>
            <option value="false">Not deleted</option>
            <option value="true">Deleted</option>
          </select>
        </FilterField>
        <FilterField label="Joined from">
          <input className="input-field" type="date" value={createdFrom} onChange={e => { setCreatedFrom(e.target.value); setPage(1) }} />
        </FilterField>
        <FilterField label="Joined to">
          <input className="input-field" type="date" value={createdTo} onChange={e => { setCreatedTo(e.target.value); setPage(1) }} />
        </FilterField>
      </FilterBar>

      <DataTable columns={columns} rows={users} rowKey={u => u.id} loading={loading} emptyMessage="No users found" />
      <Pagination meta={meta} onPageChange={setPage} />
    </PageShell>
  )
}
