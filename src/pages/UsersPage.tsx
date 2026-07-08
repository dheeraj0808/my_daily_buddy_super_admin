import React, { useCallback, useEffect, useState } from 'react'
import { listUsers } from '../api'
import type { AdminUser, PaginationMeta } from '../types'
import { ROLE_LABELS } from '../types'
import DataTable, { Column } from '../components/ui/DataTable'
import Pagination from '../components/ui/Pagination'
import StatusBadge from '../components/ui/StatusBadge'

function roleBadgeClass(roleId: number): string {
  if (roleId === 0) return 'badge badge-purple'
  if (roleId === 1) return 'badge badge-blue'
  return 'badge badge-gray'
}

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
        page,
        limit: 10,
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
    { key: 'email', header: 'Email', render: u => <strong>{u.email}</strong> },
    { key: 'phone', header: 'Phone', render: u => u.phone || '—' },
    {
      key: 'role',
      header: 'Role',
      render: u => <span className={roleBadgeClass(u.role_id)}>{ROLE_LABELS[u.role_id] ?? `Role ${u.role_id}`}</span>,
    },
    { key: 'verified', header: 'Verified', render: u => <StatusBadge active={u.isVerified} activeLabel="Verified" inactiveLabel="Unverified" /> },
    { key: 'active', header: 'Active', render: u => <StatusBadge active={u.isActive} /> },
    { key: 'deleted', header: 'Deleted', render: u => (u.isDeleted ? <span className="badge badge-gray">Deleted</span> : '—') },
    { key: 'created', header: 'Created', render: u => new Date(u.createdAt).toLocaleDateString() },
  ]

  return (
    <div>
      <div className="page-header">
        <h2>Users</h2>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="filters">
        <div className="form-group">
          <label>Search</label>
          <input
            value={search}
            placeholder="Email or phone"
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
            <option value="">All</option>
            <option value="0">Super Admin</option>
            <option value="1">Admin</option>
            <option value="2">User</option>
          </select>
        </div>
        <div className="form-group">
          <label>Active</label>
          <select value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(1) }}>
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="form-group">
          <label>Deleted</label>
          <select value={deletedFilter} onChange={e => { setDeletedFilter(e.target.value); setPage(1) }}>
            <option value="">All</option>
            <option value="false">Not deleted</option>
            <option value="true">Deleted</option>
          </select>
        </div>
        <div className="form-group">
          <label>Created From</label>
          <input type="date" value={createdFrom} onChange={e => { setCreatedFrom(e.target.value); setPage(1) }} />
        </div>
        <div className="form-group">
          <label>Created To</label>
          <input type="date" value={createdTo} onChange={e => { setCreatedTo(e.target.value); setPage(1) }} />
        </div>
      </div>

      <DataTable columns={columns} rows={users} rowKey={u => u.id} loading={loading} emptyMessage="No users found." />
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  )
}
