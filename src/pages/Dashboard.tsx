import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listPlans, listSubscriptions, listUsers } from '../api'

interface Stats {
  totalPlans: number | null
  activePlans: number | null
  totalSubscriptions: number | null
  activeSubscriptions: number | null
  totalUsers: number | null
}

const INITIAL_STATS: Stats = {
  totalPlans: null,
  activePlans: null,
  totalSubscriptions: null,
  activeSubscriptions: null,
  totalUsers: null,
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>(INITIAL_STATS)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [plansRes, activePlansRes, subsRes, activeSubsRes, usersRes] = await Promise.all([
          listPlans({ limit: 1 }),
          listPlans({ limit: 1, is_active: 'true' }),
          listSubscriptions({ limit: 1 }),
          listSubscriptions({ limit: 1, is_active: 'true' }),
          listUsers({ limit: 1 }),
        ])
        if (cancelled) return
        setStats({
          totalPlans: plansRes.meta?.total ?? 0,
          activePlans: activePlansRes.meta?.total ?? 0,
          totalSubscriptions: subsRes.meta?.total ?? 0,
          activeSubscriptions: activeSubsRes.meta?.total ?? 0,
          totalUsers: usersRes.meta?.total ?? 0,
        })
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard stats')
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, to: '/users' },
    { label: 'Total Plans', value: stats.totalPlans, to: '/plans' },
    { label: 'Active Plans', value: stats.activePlans, to: '/plans' },
    { label: 'Total Subscriptions', value: stats.totalSubscriptions, to: '/subscriptions' },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, to: '/subscriptions' },
  ]

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stats-grid">
        {cards.map(card => (
          <Link key={card.label} to={card.to} className="stat-card">
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value ?? '—'}</div>
          </Link>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <Link to="/plans"><button type="button">Manage Plans</button></Link>
          <Link to="/subscriptions"><button type="button" className="btn-secondary">Assign Subscription</button></Link>
          <Link to="/users"><button type="button" className="btn-secondary">Browse Users</button></Link>
          <Link to="/notifications"><button type="button" className="btn-secondary">Process Notifications</button></Link>
        </div>
      </div>
    </div>
  )
}
